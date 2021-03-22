// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExERC20{
    //发行机构
    address public _oranizationAddress;
    address public _ERC20Address;
    constructor(address oranizationAddress_, address ERC20Address_) {
        _oranizationAddress = oranizationAddress_;
        _ERC20Address = ERC20Address_;
    }
    
}