// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IERC20.sol";
import "./IFXEngine.sol";

/**
 * @title PayerX
 * @dev Non-custodial Smart Payment Router for ARC blockchain
 * Enables atomic cross-stablecoin payments with built-in slippage protection
 * 
 * Features:
 * - Generic FX engine integration (works with StableFX, Uniswap, etc.)
 * - Emergency pause mechanism
 * - Optional fee collection
 * - Token whitelist for security
 * - Multi-decimal support (handles USDC 6 vs 18 decimals)
 * - Non-custodial design
 */
contract PayerX is Ownable, Pausable, ReentrancyGuard {
    // Address of the FX Engine (can be StableFX, Uniswap, or any DEX)
    IFXEngine public fxEngine;

    // Fee configuration (in basis points: 10000 = 100%)
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 100; // 1% max fee
    address public feeCollector;

    // Token whitelist
    mapping(address => bool) public whitelistedTokens;
    bool public whitelistEnabled;

    // Events
    event PaymentRouted(
        address indexed sender,
        address indexed recipient,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    );

    event FXEngineUpdated(address indexed oldEngine, address indexed newEngine);
    
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    
    event TokenWhitelisted(address indexed token, bool status);
    
    event WhitelistStatusChanged(bool enabled);
    
    event FeeCollected(address indexed token, uint256 amount);

    /**
     * @dev Constructor sets the FX Engine address and initial configuration
     * @param _fxEngine Address of the FX Engine contract (StableFX, Uniswap, etc.)
     * @param _feeCollector Address that receives collected fees
     * @param _feeBps Fee in basis points (100 = 1%)
     */
    constructor(
        address _fxEngine,
        address _feeCollector,
        uint256 _feeBps
    ) Ownable(msg.sender) {
        require(_fxEngine != address(0), "PayerX: FX Engine cannot be zero address");
        require(_feeBps <= MAX_FEE_BPS, "PayerX: Fee exceeds maximum");
        
        fxEngine = IFXEngine(_fxEngine);
        feeCollector = _feeCollector;
        feeBps = _feeBps;
        whitelistEnabled = false;
    }

    /**
     * @dev Core function: Routes a payment through the FX Engine
     * @param tokenIn Address of the input stablecoin (sender pays with this)
     * @param tokenOut Address of the output stablecoin (recipient receives this)
     * @param amountIn Amount of input tokens to send
     * @param minAmountOut Minimum acceptable output amount (slippage protection)
     * @param recipient Address that will receive the output tokens
     * @return amountOut The actual amount of output tokens sent to recipient
     *
     * Requirements:
     * - Contract must not be paused
     * - Tokens must be whitelisted (if whitelist is enabled)
     * - Sender must have approved PayerX to spend at least `amountIn` of `tokenIn`
     * - All steps execute atomically in a single transaction
     * - Transaction reverts if slippage protection is violated
     */
    function routeAndPay(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(tokenIn != address(0), "PayerX: tokenIn cannot be zero address");
        require(tokenOut != address(0), "PayerX: tokenOut cannot be zero address");
        require(amountIn > 0, "PayerX: amountIn must be greater than zero");
        require(recipient != address(0), "PayerX: recipient cannot be zero address");

        // Check whitelist if enabled
        if (whitelistEnabled) {
            require(whitelistedTokens[tokenIn], "PayerX: tokenIn not whitelisted");
            require(whitelistedTokens[tokenOut], "PayerX: tokenOut not whitelisted");
        }

        // Step 1: Pull tokens from sender to this contract
        bool success = IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        require(success, "PayerX: transferFrom failed");

        // Step 2: Calculate fee (if any)
        uint256 feeAmount = 0;
        uint256 amountAfterFee = amountIn;
        
        if (feeBps > 0 && feeCollector != address(0)) {
            feeAmount = (amountIn * feeBps) / 10000;
            amountAfterFee = amountIn - feeAmount;
            
            // Transfer fee to collector
            if (feeAmount > 0) {
                IERC20(tokenIn).transfer(feeCollector, feeAmount);
                emit FeeCollected(tokenIn, feeAmount);
            }
        }

        // Step 3: Approve FX Engine to spend our tokens
        IERC20(tokenIn).approve(address(fxEngine), amountAfterFee);

        // Step 4: Perform atomic swap through FX Engine
        // Adjust minAmountOut proportionally if fee was taken
        uint256 adjustedMinOut = minAmountOut;
        if (feeAmount > 0 && amountIn > 0) {
            adjustedMinOut = (minAmountOut * amountAfterFee) / amountIn;
        }

        amountOut = fxEngine.swap(
            tokenIn,
            tokenOut,
            amountAfterFee,
            adjustedMinOut,
            recipient  // Tokens go directly to recipient
        );

        // Emit event for transparency and tracking
        emit PaymentRouted(
            msg.sender,
            recipient,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            feeAmount
        );

        return amountOut;
    }

    /**
     * @dev Allows owner to update the FX Engine address
     * @param _fxEngine New FX Engine address
     */
    function updateFXEngine(address _fxEngine) external onlyOwner {
        require(_fxEngine != address(0), "PayerX: FX Engine cannot be zero address");
        address oldEngine = address(fxEngine);
        fxEngine = IFXEngine(_fxEngine);
        emit FXEngineUpdated(oldEngine, _fxEngine);
    }

    /**
     * @dev Update fee configuration
     * @param _feeBps New fee in basis points (100 = 1%)
     */
    function updateFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "PayerX: Fee exceeds maximum");
        uint256 oldFee = feeBps;
        feeBps = _feeBps;
        emit FeeUpdated(oldFee, _feeBps);
    }

    /**
     * @dev Update fee collector address
     * @param _feeCollector New fee collector address
     */
    function updateFeeCollector(address _feeCollector) external onlyOwner {
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }

    /**
     * @dev Whitelist or delist a token
     * @param token Token address
     * @param status True to whitelist, false to delist
     */
    function setTokenWhitelist(address token, bool status) external onlyOwner {
        require(token != address(0), "PayerX: Token cannot be zero address");
        whitelistedTokens[token] = status;
        emit TokenWhitelisted(token, status);
    }

    /**
     * @dev Batch whitelist multiple tokens
     * @param tokens Array of token addresses
     * @param status True to whitelist, false to delist
     */
    function batchSetTokenWhitelist(address[] calldata tokens, bool status) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "PayerX: Token cannot be zero address");
            whitelistedTokens[tokens[i]] = status;
            emit TokenWhitelisted(tokens[i], status);
        }
    }

    /**
     * @dev Enable or disable whitelist enforcement
     * @param enabled True to enable whitelist, false to disable
     */
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
        emit WhitelistStatusChanged(enabled);
    }

    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get estimated output amount for a potential payment
     * @param tokenIn Address of the input stablecoin
     * @param tokenOut Address of the output stablecoin
     * @param amountIn Amount of input tokens
     * @return estimatedAmountOut Estimated amount of output tokens
     */
    function getEstimatedOutput(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 estimatedAmountOut) {
        return fxEngine.getEstimatedAmount(tokenIn, tokenOut, amountIn);
    }
}
