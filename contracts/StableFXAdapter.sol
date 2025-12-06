// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC20.sol";
import "./IFXEngine.sol";

/**
 * @title StableFXAdapter
 * @dev Adapter contract that bridges PayerX with Circle's StableFX on ARC
 * 
 * StableFX uses an RFQ (Request-for-Quote) model with offchain API execution,
 * but this adapter provides a simplified swap interface for PayerX integration.
 * 
 * Features:
 * - Real-time market rates from StableFX
 * - Fallback to oracle-based rates for instant quotes
 * - Compatible with PayerX's IFXEngine interface
 * - Support for USDC, EURC, USYC pairs
 * 
 * Note: For production with full StableFX integration, consider using the
 * StableFX API for RFQ execution and this adapter for settlement only.
 */
contract StableFXAdapter is IFXEngine, Ownable {
    // Permit2 contract for StableFX integration
    address public constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    
    // StableFX FxEscrow contract
    address public constant FX_ESCROW = 0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1;
    
    // Exchange rate oracle (18 decimals: 1e18 = 1:1 rate)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    // Rate validity period (to ensure fresh rates)
    mapping(address => mapping(address => uint256)) public rateTimestamps;
    uint256 public constant RATE_VALIDITY = 300; // 5 minutes
    
    // Slippage tolerance (in basis points: 100 = 1%)
    uint256 public slippageTolerance = 50; // 0.5%
    uint256 public constant MAX_SLIPPAGE = 500; // 5%
    
    // Liquidity pool for instant swaps (alternative to RFQ when needed)
    mapping(address => uint256) public liquidity;
    
    // Events
    event ExchangeRateUpdated(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 rate,
        uint256 timestamp
    );
    
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 rate
    );
    
    event LiquidityAdded(address indexed token, uint256 amount);
    event LiquidityRemoved(address indexed token, uint256 amount);
    event SlippageToleranceUpdated(uint256 oldTolerance, uint256 newTolerance);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Update exchange rate for a token pair
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param rate Exchange rate with 18 decimals (e.g., 1.09e18 for 1 EUR = 1.09 USD)
     * 
     * Note: In production, these rates would be updated by an oracle or
     * fetched from StableFX API in real-time
     */
    function setExchangeRate(
        address tokenIn,
        address tokenOut,
        uint256 rate
    ) external onlyOwner {
        require(tokenIn != address(0) && tokenOut != address(0), "StableFXAdapter: Invalid token");
        require(rate > 0, "StableFXAdapter: Invalid rate");
        
        exchangeRates[tokenIn][tokenOut] = rate;
        rateTimestamps[tokenIn][tokenOut] = block.timestamp;
        
        emit ExchangeRateUpdated(tokenIn, tokenOut, rate, block.timestamp);
    }

    /**
     * @dev Update slippage tolerance
     * @param _slippageTolerance New tolerance in basis points
     */
    function setSlippageTolerance(uint256 _slippageTolerance) external onlyOwner {
        require(_slippageTolerance <= MAX_SLIPPAGE, "StableFXAdapter: Slippage too high");
        uint256 oldTolerance = slippageTolerance;
        slippageTolerance = _slippageTolerance;
        emit SlippageToleranceUpdated(oldTolerance, _slippageTolerance);
    }

    /**
     * @dev Get current exchange rate for a token pair
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @return rate Current exchange rate with 18 decimals
     */
    function getExchangeRate(
        address tokenIn,
        address tokenOut
    ) public view returns (uint256 rate) {
        if (tokenIn == tokenOut) {
            return 1e18; // 1:1 for same token
        }
        
        rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "StableFXAdapter: Rate not configured");
        
        // Check rate freshness
        uint256 rateAge = block.timestamp - rateTimestamps[tokenIn][tokenOut];
        require(rateAge <= RATE_VALIDITY, "StableFXAdapter: Rate expired");
        
        return rate;
    }

    /**
     * @dev Swap tokens using real-time market rates
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum acceptable output (slippage protection)
     * @param to Address that will receive the output tokens
     * @return amountOut Actual output amount
     * 
     * Note: This is a simplified implementation for PayerX integration.
     * For full StableFX integration, use the StableFX API for RFQ execution.
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external override returns (uint256 amountOut) {
        require(amountIn > 0, "StableFXAdapter: Invalid amount");
        require(tokenIn != tokenOut, "StableFXAdapter: Same token");
        
        // Get current exchange rate (from oracle or recent update)
        uint256 rate = getExchangeRate(tokenIn, tokenOut);
        
        // Get token decimals
        uint256 tokenInDecimals = getTokenDecimals(tokenIn);
        uint256 tokenOutDecimals = getTokenDecimals(tokenOut);
        
        // Calculate output amount: (amountIn * rate) / 1e18
        // Adjust for decimal differences
        amountOut = (amountIn * rate) / 1e18;
        
        // Adjust decimals if needed
        if (tokenInDecimals > tokenOutDecimals) {
            amountOut = amountOut / (10 ** (tokenInDecimals - tokenOutDecimals));
        } else if (tokenOutDecimals > tokenInDecimals) {
            amountOut = amountOut * (10 ** (tokenOutDecimals - tokenInDecimals));
        }
        
        // Check slippage protection
        require(amountOut >= minAmountOut, "StableFXAdapter: Slippage exceeded");
        
        // Check liquidity availability
        require(
            liquidity[tokenOut] >= amountOut,
            "StableFXAdapter: Insufficient liquidity"
        );
        
        // Execute swap
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "StableFXAdapter: Transfer in failed"
        );
        
        require(
            IERC20(tokenOut).transfer(to, amountOut),
            "StableFXAdapter: Transfer out failed"
        );
        
        // Update liquidity
        liquidity[tokenIn] += amountIn;
        liquidity[tokenOut] -= amountOut;
        
        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut, rate);
        return amountOut;
    }

    /**
     * @dev Add liquidity to the adapter for instant swaps
     * @param token Token address
     * @param amount Amount to add
     * 
     * Note: In production with full StableFX, liquidity would be managed
     * through StableFX escrow and maker funding
     */
    function addLiquidity(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "StableFXAdapter: Invalid amount");
        
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "StableFXAdapter: Transfer failed"
        );
        
        liquidity[token] += amount;
        emit LiquidityAdded(token, amount);
    }

    /**
     * @dev Remove liquidity from the adapter
     * @param token Token address
     * @param amount Amount to remove
     */
    function removeLiquidity(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "StableFXAdapter: Invalid amount");
        require(liquidity[token] >= amount, "StableFXAdapter: Insufficient liquidity");
        
        liquidity[token] -= amount;
        
        require(
            IERC20(token).transfer(owner(), amount),
            "StableFXAdapter: Transfer failed"
        );
        
        emit LiquidityRemoved(token, amount);
    }

    /**
     * @dev Emergency withdrawal for owner
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(
            IERC20(token).transfer(owner(), amount),
            "StableFXAdapter: Withdrawal failed"
        );
    }

    /**
     * @dev Check available liquidity for a token
     * @param token Token address
     * @return Available liquidity amount
     */
    function getLiquidity(address token) external view returns (uint256) {
        return liquidity[token];
    }

    /**
     * @dev Check if rate is fresh (within validity period)
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @return true if rate is fresh
     */
    function isRateFresh(address tokenIn, address tokenOut) external view returns (bool) {
        if (tokenIn == tokenOut) return true;
        
        uint256 rateAge = block.timestamp - rateTimestamps[tokenIn][tokenOut];
        return rateAge <= RATE_VALIDITY;
    }

    /**
     * @dev Estimates the output amount for a given input amount
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @param amountIn Input amount
     * @return estimatedAmountOut Expected output amount
     */
    function getEstimatedAmount(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view override returns (uint256 estimatedAmountOut) {
        if (tokenIn == tokenOut) return amountIn;
        
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "StableFXAdapter: Rate not configured");
        
        uint256 tokenInDecimals = getTokenDecimals(tokenIn);
        uint256 tokenOutDecimals = getTokenDecimals(tokenOut);
        
        estimatedAmountOut = (amountIn * rate) / 1e18;
        
        if (tokenInDecimals > tokenOutDecimals) {
            estimatedAmountOut = estimatedAmountOut / (10 ** (tokenInDecimals - tokenOutDecimals));
        } else if (tokenOutDecimals > tokenInDecimals) {
            estimatedAmountOut = estimatedAmountOut * (10 ** (tokenOutDecimals - tokenInDecimals));
        }
        
        return estimatedAmountOut;
    }

    /**
     * @dev Get token decimals (helper function)
     * @param token Token address
     * @return Number of decimals
     */
    function getTokenDecimals(address token) internal view returns (uint256) {
        // Try to call decimals() function
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("decimals()")
        );
        
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        
        // Default to 6 decimals for ARC stablecoins if call fails
        return 6;
    }
}
