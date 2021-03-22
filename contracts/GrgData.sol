// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*2021\3\12
 *GRGchain
 *Feiyang Tan
 */
 
    
//grg管理合约数据
contract grgData{
    //组织结构体
    struct Organization{
        uint ID;//组织ID,对应_orgList的index
        string name;//组织名称
        address orgAddress;//组织合约地址
        OrgType orgType;//组织种类
        OrgState orgState;//组织状态
        uint issueDate;//组织加入的时间
    }
    //组织类型
    enum OrgType{enterprice, goverment, school, others}
    //组织状态
    enum OrgState{valid, frozen, invalid}
    
    //组织列表
    mapping(uint => Organization) public _orgList;
    //
    mapping(uint => OrgState) public _orgState;
    uint _orgNum;
}