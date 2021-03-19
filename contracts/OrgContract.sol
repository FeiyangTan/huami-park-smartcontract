// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*2021\3\12
 *GRGchain
 *Feiyang Tan
 */

import "token/ERC20/IERC20.sol";
//import "github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "AdminManage.sol";
import "GrgData.sol";

//发布新的组织（客户）合约
contract OrgContract is adminManage, grgData{
    //grg管理合约地址
    address internal _grgDataAddress;
    //机构ID
    uint internal _orgID;
    
    //资产列表
    Asset[] public ERC20AssetList;
    Asset[] public ERC721AssetList;
    //资产结构体
    struct Asset{
        uint ID;
        address assetAddress;
    }
    
    //输入初试管理员名称、允许最多的管理员数量
    constructor(string memory initialAdminName,uint8 maxAdminNum,address adminAddress,address grgAddress_,uint orgID_){
        //规定最大管理员数量
        require(maxAdminNum > 0,"maxAdminNum must bigger than 0");
        _maxAdminNum = maxAdminNum;
        
        //添加新管理员
        addAdmin(0,initialAdminName,adminAddress);
        //更新grg管理合约地址
        _grgDataAddress = grgAddress_;
        //更新本机构的ID
        _orgID = orgID_;
    }

    //发布新ERC20资产
    // function addERC20(string memory name, string memory symbol, uint totalsupply, uint8 decimal) public onlyAdmin orgState{
    //     //
    //     ERC20 newERC20 = new ERC20(name,symbol,totalsupply, decimal);
    //     Asset memory newAsset = Asset(ERC20AssetList.length, address(newERC20));
    //     ERC20AssetList.push(newAsset);
    // }
    function addERC20(address tokenAddress_) public onlyAdmin orgState{
        //
        Asset memory newAsset = Asset(ERC20AssetList.length, tokenAddress_);
        ERC20AssetList.push(newAsset);
    }

    //ERC20资产转账
    // function ERC20Transfer(uint tokenContractID, address recipient, uint amount) public onlyAdmin orgState{
    //     ERC20(ERC20AssetList[tokenContractID].assetAddress).transfer(recipient,amount);
    // }
    function ERC20Transfer(uint tokenContractID, address recipient, uint amount) public onlyAdmin orgState{
        IERC20(ERC20AssetList[tokenContractID].assetAddress).transfer(recipient,amount);
    }

    //ERC20红包发送
    //function ERC20HBSent(address[] recipientList, uint8 recipientNum) public{
    //    
    //}

    
    //发布新的ERC721
    // function addERC721(string memory name, string memory symbol, address OrgContractAddress) public onlyAdmin orgState{
    //     ERC721 newERC721 = new ERC721(name,symbol,OrgContractAddress);
    //     Asset memory newAsset = Asset(ERC20AssetList.length, address(newERC721));
    //     ERC20AssetList.push(newAsset);
    // }
    
    
    //
    // function ECR721Mind(uint tokenContractID, uint tokenID, uint startDate, uint expireDare, string memory username, address to) public onlyAdmin orgState{
    //     IERC721(ERC721AssetList[tokenContractID].assetAddress).mind(tokenID,startDate,expireDare,username,to);
        
    // }

    //检测grg管理合约中机构状态
    modifier orgState{
        OrgState org = grgData(_grgDataAddress)._orgState(0);
        require(org == OrgState(0),"orgState is frozen of invalid");
        _;
    }
    
    //后期添加合约更多权限管理：
    //资产合约所有选配功能管理功能对组织（客户）合约
    //生成资产时，确认资产功能
}