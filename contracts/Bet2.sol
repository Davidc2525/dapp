// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Bet2 {
    address owner;
    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }


    event user_recharge(address from, uint256 amount, string inoviceid);

    function recharge(string memory inoviceid) public payable returns (uint256) {
        if (msg.value > 0) {
            emit user_recharge(msg.sender, msg.value, inoviceid);
            return 1;
        } else {
            require(false);
            return 0;
        }
    }

    function add_founds()public payable onlyOwner {
    }

    function get_balance() public view returns(uint) {
        return address(this).balance;
    }

    function send_withdraw(address payable _to,uint256 amount) public  onlyOwner{
        (_to).transfer(amount);       
    }

    function withdraw()public onlyOwner{        
        payable(owner).transfer(get_balance());
    }

  
}


