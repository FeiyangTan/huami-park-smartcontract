const { default: Web3 } = require("web3");

//通过artifacts.require()引入合约对象 创建合约实例
const UserManager = artifacts.require("UserManager"); 
const TicketManager = artifacts.require("TicketManager"); 
const Ticket = artifacts.require("Ticket"); 
const TicketData = artifacts.require("TicketData");

contract("TicketChain", accounts => {
    var user1 = {"account":accounts[0],"name":"user1","type":0}
    var user2 = {"account":accounts[1],"name":"user2","type":0}
    var scenic = {"account":accounts[2],"name":"scenic","type":2}
    var issueCompany = {"account":accounts[3],"name":"issueCompany","type":1}

    // user register
    it("Register" , async () => {
        // deploy contract
        userManager = await UserManager.deployed();
        ticketData = await TicketData.deployed();
        ticketManager = await TicketManager.deployed(userManager.address, ticketData.address);

        await userManager.userRegister(user1.name,user1.type,{from:user1.account});
        await userManager.userRegister(user2.name,user2.type,{from:user2.account});
        await userManager.userRegister(scenic.name,scenic.type,{from:scenic.account});
        await userManager.userRegister(issueCompany.name,issueCompany.type,{from:issueCompany.account});
        // // issue company bind scenic
        // await userManager.bindScenic(scenic.account,{from:issueCompany.account});
        
        let user1Res = await userManager.getUserInfo(user1.account);
        assert.equal(user1Res.name, user1.name,"User name");
        let issueRes = await userManager.getIssueCoInfo(issueCompany.account);
        assert.equal(issueRes.name, issueCompany.name,"Issuer name");
        let scenicRes = await userManager.getScenicInfo(scenic.account);
        assert.equal(scenicRes.name, scenic.name,"Issuer name");
        // assert.equal(scenicRes.issueCompany, issueCompany.name,"bind issue company name");
    })

    // issue Ticket
    it("Issue Ticket", async () => {
        // Issue Ticket 
        ticket = {"scenic":scenic.name,"scenicAddr":scenic.account,"ticketId":"uuid-abcd-def-100","price":10,"total":200,"sDate":2020,"eDate":2021,"comment":"test"};
        ticket2 = {"scenic":scenic.name,"scenicAddr":scenic.account,"ticketId":"uuid-abcd-def-200","price":20,"total":100,"sDate":2020,"eDate":2021,"comment":"test"};
        await ticketManager.issueTicket(ticket.scenic,ticket.scenicAddr,ticket.ticketId,ticket.price,ticket.total,ticket.sDate,ticket.eDate,ticket.comment,{from:issueCompany.account});
        await ticketManager.issueTicket(ticket2.scenic,ticket2.scenicAddr,ticket2.ticketId,ticket2.price,ticket2.total,ticket2.sDate,ticket2.eDate,ticket2.comment,{from:issueCompany.account});
        let issueRes = await userManager.getIssueCoInfo(issueCompany.account);
        assert.equal(issueRes.scenicTickets[0], ticket.ticketId, " issue company record ticketId");
        assert.equal(issueRes.scenicTickets[1], ticket2.ticketId, " issue company record ticketId");
    })

    // get root ticket info
    it("getTicketInfo", async () => {
        // get Ticket info
        let ticketRes = await ticketManager.getTicketInfo(ticket.ticketId);
        // return bignum need to be parsed
        let priceRes = parseInt(ticketRes.price)
        assert.equal(priceRes,ticket.price," ticket price is correct")
    })
    
    // issue Ticket
    it("Update Issue Ticket", async () => {
        // Issue Ticket 
        ticket3 = {"scenic":scenic.name,"scenicAddr":scenic.account,"ticketId":"uuid-abcd-def-100","price":10,"total":300,"sDate":2020,"eDate":2021,"comment":"test"};
        await ticketManager.updateTicket(ticket.scenic,ticket.scenicAddr,ticket.ticketId,ticket.price,ticket.total,ticket.sDate,ticket.eDate,ticket.comment,{from:issueCompany.account});
        let issueRes = await userManager.getIssueCoInfo(issueCompany.account);
        assert.equal(issueRes.scenicTickets[0], ticket.ticketId, " issue company record ticketId");
        // get Ticket info
        let ticketRes = await ticketManager.getTicketInfo(ticket.ticketId);
        // return bignum need to be parsed
        let priceRes = parseInt(ticketRes.price)
        assert.equal(priceRes,ticket3.price," ticket price is correct")
    })

    // mint ticket (issue cTicket for user)
    it("mint Ticket", async () => {
        cTicket = {"id":["100100"]};
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicket.id,{from:issueCompany.account});
        // check user hold tickets
        let user1Res = await userManager.getUserInfo(user1.account);
        assert.equal(user1Res.mintTickets[0], cTicket.id[0],"check user hold tickets");
        // check cTicket info 
        let cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket.id[0]);
        assert.equal(cTicketRes.holder, user1.account, "cTickets hold is user1");
    })

    // get issued cTicket
    it("get issued cTicket", async () => {
        // Issue Ticket 
        let issuedTicketRes = await userManager.getIssuedTicketInfo(issueCompany.account,ticket.ticketId);
        // console.log("issuedTicketRes》》》》》》》》》》",issuedTicketRes)
        assert.equal(issuedTicketRes[0], cTicket.id, " issue company record cticketId");
    })

    // tranfer ticket
    it("transfer cTicket", async () => {
        transferInfo = {"transferPrice":20};
        await ticketManager.transferTicket(user2.account,ticket.ticketId,cTicket.id,transferInfo.transferPrice);
        // get transfer info 
        let transferInfoRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket.id[0]);
        assert.equal(transferInfoRes.toUser, user2.account, "cTickets transfer info toUser is user2");
    })

    // accpet ticket
    it("accept cTicket", async () => {
        // user2 accpet cTicket
        await ticketManager.acceptTicket(ticket.ticketId, cTicket.id, 0, {from:user2.account});
        let user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        let user2Res = await userManager.getUserInfo(user2.account);
        assert.equal(user2Res.mintTickets[0], cTicket.id[0],"user2 hold this ticket");
        // get cTicket Info
        let cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket.id[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 , normal");
        assert.equal(cTicketRes.holder, user2.account,"user2 hold this cTicket");
        // get transfer Info
        let cTicketTransferRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket.id[0]);
        assert.equal(cTicketTransferRes.transferState, 2,"user2 accept tranfereed");
        // test user1 balance
        // console.log(user1Res.balance.toString())
        assert.equal(user1Res.soldTickets[0],cTicket.id, "user1 sold this ticket");
        assert.equal(user1Res.balance,transferInfo.transferPrice, "user1 balance equles transfer price");
        // scenic check user cTicket
        await ticketManager.checkcTicket(user2.account,ticket.ticketId,cTicket.id[0],{from:scenic.account});
        // get User2 info
        user2Res = await userManager.getUserInfo(user2.account);
        assert.equal(user2Res.usedTickets[0], cTicket.id[0],"user2 used this ticket"); 
        let scenicRes = await userManager.getScenicInfo(scenic.account);
        // console.log("scenicRes: ", scenicRes);
        assert.equal(scenicRes.checkedTickets[0], cTicket.id[0],"scenic checked this ticket");         
    })

    // list ticket and buy ticket from market
    it("list cTicket", async () => {
        // user1 mint cticket
        cTicket1 = {"id":["100101"]};
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicket1.id,{from:issueCompany.account});
        // check user hold tickets
        user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        assert.equal(user1Res.mintTickets[1], cTicket1.id[0],"check user hold tickets");
        // check cTicket info 
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket1.id[0]);
        assert.equal(cTicketRes.holder, user1.account, "cTickets hold is user1");
        // user1 list cticket
        transferInfo1 = {price:100}
        await ticketManager.listTicket(ticket.ticketId,cTicket1.id,transferInfo1.price)
        // user2 buy cTicket from market
        await ticketManager.buyTicketFromMarket(ticket.ticketId, cTicket1.id, {from:user2.account});
        user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        user2Res = await userManager.getUserInfo(user2.account);
        assert.equal(user2Res.mintTickets[1], cTicket1.id[0],"user2 hold this ticket");
        // get cTicket Info
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket1.id[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 ,normal");
        assert.equal(cTicketRes.holder, user2.account,"user2 hold this cTicket");
        // get transfer Info
        cTicketTransferRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket1.id[0]);
        assert.equal(cTicketTransferRes.transferState, 2,"user2 accept tranfereed");
        // test user1 balance
        // console.log(user1Res.balance.toString())
        assert.equal(user1Res.balance,transferInfo.transferPrice+transferInfo1.price, "user1 balance equles transfer price")
    })

    // list ticket and buy ticket from market
    it("cancel cTicket sold", async () => {
        // user1 mint cticket
        cTicket2 = {"id":["100102"]};
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicket2.id,{from:issueCompany.account});
        // check user hold tickets
        user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        assert.equal(user1Res.mintTickets[2], cTicket2.id[0],"check user hold tickets");
        // check cTicket info 
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket2.id[0]);
        assert.equal(cTicketRes.holder, user1.account, "cTickets hold is user1");
        // user1 list cticket
        transferInfo2 = {price:100}
        await ticketManager.listTicket(ticket.ticketId,cTicket2.id,transferInfo2.price)
        await ticketManager.cancelSoldTicket(ticket.ticketId,cTicket2.id)
        // get cTicket Info
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket2.id[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 , change to normal");
        assert.equal(cTicketRes.holder, user1.account,"user2 hold this cTicket");
        // get transfer Info
        cTicketTransferRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket2.id[0]);
        assert.equal(cTicketTransferRes.transferState, 0,"transferinto is normal");
    })

    // change ticket and buy ticket from market
    it("change cTicket", async () => {
        // user1 mint cticket
        cTicket3 = {"id":["100103"]};
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicket3.id,{from:issueCompany.account});
        // check user hold tickets
        user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        assert.equal(user1Res.mintTickets[3], cTicket3.id[0],"check user hold tickets");
        // check cTicket info 
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket3.id[0]);
        assert.equal(cTicketRes.holder, user1.account, "cTickets hold is user1");
        // user1 list cticket
        transferInfo3_1 = {price:100}
        transferInfo3_2 = {price:20000}
        await ticketManager.listTicket(ticket.ticketId,cTicket3.id,transferInfo3_1.price)
        await ticketManager.listTicket(ticket.ticketId,cTicket3.id,transferInfo3_2.price)
        // user2 buy cTicket from market
        await ticketManager.buyTicketFromMarket(ticket.ticketId, cTicket3.id, {from:user2.account});
        user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        user2Res = await userManager.getUserInfo(user2.account);
        assert.equal(user2Res.mintTickets[2], cTicket3.id[0],"user2 hold this ticket");
        // get cTicket Info
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket3.id[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 , normal");
        assert.equal(cTicketRes.holder, user2.account,"user2 hold this cTicket");
        // get transfer Info
        cTicketTransferRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicket3.id[0]);
        assert.equal(cTicketTransferRes.transferState, 2,"user2 accept tranfereed");
        // test user1 balance
        // console.log(user1Res.balance.toString())
        assert.equal(user1Res.balance,transferInfo.transferPrice+transferInfo1.price+transferInfo3_2.price, "user1 balance equles transfer price")
    })

    // draw balance
    it("draw balance", async () => {
        // user1 mint cticket
        await userManager.drawBalance({from:user1.account})
        // check user balance
        user1Res = await userManager.getUserInfo(user1.account);
        // console.log("user1Res: ", user1Res);
        assert.equal(user1Res.balance, 0,"check user balance");        
    })

    // array parameter
    it("batch mint / transfer / accept", async () => {
        let perfix = "uuid-abcdefg-abcdefg-000000";
        let cTicketlist = [];
        for(let i=0;i<50;i++){
            cTicketlist.push(perfix+i)
        }
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicketlist,{from:issueCompany.account});
        // check user hold tickets
        let user1Res = await userManager.getUserInfo(user1.account);
        assert.equal(user1Res.mintTickets[0], cTicket.id[0],"check user hold tickets");
        // check cTicket info 
        let cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(cTicketRes.holder, user1.account, "cTickets hold is user1");
        // check batch transfer
        await ticketManager.transferTicket(user2.account,ticket.ticketId,cTicketlist,20,{from:user1.account});
        let transferInfoRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(transferInfoRes.toUser, user2.account, "cTickets transfer info toUser is user2");
        assert.equal(transferInfoRes.state, 1, "cTickets state info is locked");
        assert.equal(transferInfoRes.transferPrice, 20, "cTickets transfer price info is 20");
        await ticketManager.transferTicket(user2.account,ticket.ticketId,cTicketlist,30,{from:user1.account});
        transferInfoRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(transferInfoRes.toUser, user2.account, "cTickets transfer info toUser is user2");
        assert.equal(transferInfoRes.state, 1, "cTickets state info is locked");
        assert.equal(transferInfoRes.transferPrice, 30, "cTickets transfer price info is 30");
        // check batch accept ticket
        await ticketManager.acceptTicket(ticket.ticketId,cTicketlist,0,{from:user2.account});
        let user2Res = await userManager.getUserInfo(user2.account);
        // console.log(user2Res)
        assert.equal(user2Res.mintTickets[3], cTicketlist[0],"user2 hold this ticket");
        // get cTicket Info
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 , normal");
        assert.equal(cTicketRes.holder, user2.account,"user2 hold this cTicket");
    })

    // array parameter
    it("batch mint / list / buy ", async () => {
        let perfix = "uuid-abcdefg-abcdefg-100000";
        let cTicketlist = [];
        for(let i=0;i<50;i++){
            cTicketlist.push(perfix+i)
        }
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicketlist,{from:issueCompany.account});
        await ticketManager.mintTicket(ticket2.ticketId,user1.account,cTicketlist,{from:issueCompany.account});
        // check batch transfer
        await ticketManager.listTicket(ticket.ticketId,cTicketlist,20,{from:user1.account});
        let transferInfoRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(transferInfoRes.state, 1, "cTickets state info is locked");
        assert.equal(transferInfoRes.transferPrice, 20, "cTickets transfer price info is 20");
        await ticketManager.listTicket(ticket.ticketId,cTicketlist,30,{from:user1.account});
        transferInfoRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(transferInfoRes.state, 1, "cTickets state info is locked");
        assert.equal(transferInfoRes.transferPrice, 30, "cTickets transfer price info is 30");
        // check batch accept ticket
        await ticketManager.buyTicketFromMarket(ticket.ticketId,cTicketlist,{from:user2.account});
        let user2Res = await userManager.getUserInfo(user2.account);
        // console.log(user2Res)
        assert.equal(user2Res.mintTickets[53], cTicketlist[0],"user2 hold this ticket");
        // get cTicket Info
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 , normal");
        assert.equal(cTicketRes.holder, user2.account,"user2 hold this cTicket");
    })

    // array parameter
    it("cancel sold ticket", async () => {
        let perfix = "uuid-abcdefg-abcdefg-200000";
        let cTicketlist = [];
        for(let i=0;i<50;i++){
            cTicketlist.push(perfix+i)
        }
        await ticketManager.mintTicket(ticket.ticketId,user1.account,cTicketlist,{from:issueCompany.account});
        // check batch transfer
        await ticketManager.listTicket(ticket.ticketId,cTicketlist,20,{from:user1.account});
        // check batch accept ticket
        await ticketManager.cancelSoldTicket(ticket.ticketId,cTicketlist,{from:user1.account});
        let user2Res = await userManager.getUserInfo(user2.account);
        // get cTicket Info
        cTicketRes = await ticketManager.getcTicketInfo(ticket.ticketId,cTicketlist[0]);
        assert.equal(cTicketRes.state, 0,"cTicket state is 0 , normal");
        assert.equal(cTicketRes.holder, user1.account,"user2 hold this cTicket");
    })    

    // ticket trace query
    it("query ticket trace", async () => {
        let cTicketHash = web3.utils.keccak256("100100")
        // console.log('cTicketHash-------:',cTicketHash)
        let transferEvent = await ticketData.getPastEvents('TicketTrace',{
            // filter: {holder: scenic.account},
            // filter: {indexcTicketId: '0xe2e7b19647713731d5218866c4cb8502084496edbfa0384d8fd5b4677c0acd12'},
            topics: [, , cTicketHash], 
            fromBlock: 0,
            toBlock: 'latest'
        }).then(res => {
            console.log(res[0])
            console.log(res[0].raw.topics)

        })
    })

})

