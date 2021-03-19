// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*2021\3\12
 *GRGchain
 *Feiyang Tan
 */

//管理admin address
contract adminManage{

    //admin列表
    Admin[] public _adminList;
    
    //允许最多的admin数量，
    uint8 public _maxAdminNum;
    
    //现有管理员数量
    uint8 public _adminNum;

    //admin结构体
    struct Admin{
        uint8 ID;//管理员ID，对应_adminList
        string name;//管理员名称
        address adminAddress;//管理员外部账户地址
    }

    //事件：添加admin
    event AddAdmin(uint8 adminID,string name,address adminAddress);
    //时间：删除admin
    event DelAdmin(uint8 adminID,string name,address adminAddress);
    // //admin管理地址
    // address adminSettingContractAddress;
    // //admin管理模式
    // enum adminSettingMode{mode#1,mode#2};
    
    //添加新管理员
    //仅现有管理员能调用
    function addAdmin(uint8 adminId_,string memory adminName_,address adminAddress_) public onlyAdmin{
        //检查现有管理员数量是否已满
        require(_adminNum < _maxAdminNum,"reached maximum amount of admins");
        //检查此adminID是否被占用
        require(_adminList[adminId_].adminAddress==address(0),"invalid adminID, this ID has already been occupied");
        //生成新admin结构体
        Admin memory newAdmin = Admin(adminId_,adminName_,adminAddress_);
        //入盘
        _adminList[adminId_]=newAdmin;
        _adminNum++;
        //生成更新管理员事件
        emit AddAdmin(adminId_,adminName_,adminAddress_);
    }

    //删除管理员
    //仅现有管理员能调用
    //最后一个管理员不能删除自己
    function delAdmin(uint8 adminId_) public onlyAdmin{
        //管理员数量不能低于等于1
        require(_adminNum > 1,"reached maximum amount of admins");
        //生成删除admin事件
        emit DelAdmin(adminId_,_adminList[adminId_].name,_adminList[adminId_].adminAddress);
        //删除管理员
        delete _adminList[adminId_]; 
    }

    //仅admin
    modifier onlyAdmin(){
        bool ifAdmin;
        for(uint i =0; i<_adminList.length; i++){
            if (_adminList[i].adminAddress == msg.sender){
                ifAdmin = true;
            }
        }
        require(ifAdmin, "not admin");
        _;
    }
}