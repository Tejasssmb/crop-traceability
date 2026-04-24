// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CropTraceability {

    struct Crop {
        string farmerName;
        string cropName;
        uint quantity;
        string location;
        uint price;
        uint timestamp;
    }

    Crop[] public crops;

    function addCrop(
        string memory _farmerName,
        string memory _cropName,
        uint _quantity,
        string memory _location,
        uint _price 
    ) public {
        crops.push(Crop(
            _farmerName,
            _cropName,
            _quantity,
            _location,
            _price,
            block.timestamp
        ));
    }

    function getCrops() public view returns (Crop[] memory) {
        return crops;
    }
}