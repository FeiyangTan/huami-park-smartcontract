// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*2021\3\12
 *GRGchain
 *Feiyang Tan
 */

 //红包管理合约
 //用于管理发送后的，另取前的红包
 contract hb{
    //hb的结构
    struct HB{
        address sender;
        address recipient;
        uint amount;
        uint senderHBID;
        uint issueDate;
    }
    
    mapping(address => uint) currentHBID;
    //红包发送ID
    mapping(address => mapping(uint => HB)) _hbList;

    //添加同好
    function addHB(address recipient_, uint amount_) internal{
        currentHBID[msg.sender]++;
        HB memory newHB = HB(msg.sender,recipient_,amount_,currentHBID[msg.sender],block.timestamp);
        _hbList[msg.sender][currentHBID[msg.sender]]=newHB;
    }

    //删除红包
    function deleteHB(address sender_, uint hbID_) internal returns(uint){
        uint hbAmount = _hbList[sender_][hbID_].amount;
        //检查用户是否为接收者
        require(msg.send==_hbList[sender_][hbID_].recipient);
        //删除红包
        delete _hbList[sender_][hbID_];
        //返回红包数量
        return  hbAmount;
    }

 }