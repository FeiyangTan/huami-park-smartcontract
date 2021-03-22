// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExERC721{
    //发行机构
    address public _oranizationAddress;
    address public _ERC271Address;
    constructor(address oranizationAddress_, address ERC271Address_) {
        _oranizationAddress = oranizationAddress_;
        _ERC271Address = ERC271Address_;
    }   
}