// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*2021\3\12
 *GRGchain
 *Feiyang Tan
 */

import "AdminManage.sol";
import "GrgData.sol";
import "OrgContract.sol";

//主合约
//管理组织（客户）名单
contract grgContract is adminManage, grgData{

    //构建函数
    constructor(string memory initialAdminName_,uint8 maxAdminNum_) payable{
        //规定最大管理员数量
        require(maxAdminNum_ > 0,"maxAdminNum must bigger than 0");
        _maxAdminNum = maxAdminNum_;
        
        //添加新管理员
        //检查现有管理员数量是否已满
        require(_adminNum < _maxAdminNum,"reached maximum amount of admins");
        //生成新admin结构体
        Admin memory newAdmin = Admin(0,initialAdminName_,msg.sender);
        //入盘
        _adminList[0] = (newAdmin);
        _adminNum++;
        //生成更新管理员事件
        emit AddAdmin(0,initialAdminName_,msg.sender);
    }

    //添加新组织
    function addOrg(string memory newOrgName_,uint newOrgType_,string memory initialAdminName_, uint8 maxAdminNum_, address initialAdminAddress_) public onlyAdmin{
        //生成新的组织管理合约
        OrgContract newOranization =  new OrgContract(initialAdminName_,maxAdminNum_,initialAdminAddress_,address(this),_orgNum);
        //更新组织列表
        Organization memory newOrg = Organization(_orgNum,newOrgName_,address(newOranization),OrgType(newOrgType_),OrgState(0),block.timestamp);
        _orgList[_orgNum]=newOrg;
        _orgState[_orgNum]=OrgState(0);
        _orgNum++;
    }
    
    //冻结
    function froOrg(uint orgID_) public onlyAdmin{
        //查看是否为有效组织
        require(_orgList[orgID_].orgAddress!=address(0),"invalid orgID");
        require(_orgList[orgID_].orgState==OrgState(0),"incorrect orgState");
        //改变该组织状态
        _orgList[orgID_].orgState = OrgState(1);
        _orgState[orgID_] = OrgState(1);
    }

    //解冻组织
    function unfroOrg(uint orgID_) public onlyAdmin{
        //查看是否为有效组织
        require(_orgList[orgID_].orgAddress!=address(0),"invalid orgID");
        require(_orgList[orgID_].orgState==OrgState(1),"incorrect orgState");
        //改变该组织状态
        _orgList[orgID_].orgState = OrgState(0);
        _orgState[orgID_] = OrgState(0);
    }

    // //删除组织
    //     function delOrg(uint orgID_) public onlyAdmin{
    //     //查看是否为有效组织
    //     require(_orgList[orgID_].orgAddress!=address(0),"invalid orgID");
    //     //改变该组织状态
    //     _orgList[orgID_].orgState = OrgState(2);
    //     _orgState[orgID_] = OrgState(2);
    // }


//  Fallback() external{}
// 	Receive() external payable{
//         revert
//     }

}

