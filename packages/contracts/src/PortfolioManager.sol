// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract PortfolioManager {
    struct Composition {
        address[] assets;
        uint256[] weights;
    }

    mapping(address => Composition) private compositions;

    function getComposition()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        return (
            compositions[msg.sender].assets,
            compositions[msg.sender].weights
        );
    }

    function setComposition(
        address[] memory assets,
        uint256[] memory weights
    ) public {
        require(
            assets.length == weights.length,
            "Assets and weights must be the same size"
        );
        require(assets.length > 0, "Arrays must not be empty");
        require(assets.length <= 10, "Arrays must not be longer than 10");
        uint256 sum = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            sum += weights[i];
        }
        require(sum == 100, "Weights must sum to 100");
        compositions[msg.sender].assets = assets;
        compositions[msg.sender].weights = weights;

        // Verify tokens?
        // Allow decimal weights? need to add fixed point lib
    }
}
