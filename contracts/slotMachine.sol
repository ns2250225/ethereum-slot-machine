pragma solidity ^0.4.19;

contract SlotMachine {
    // 储存用户的余额
    mapping (address => uint) public balanceOf;

    // 获取用户的余额
    function getBalanceOf(address _address) public view returns (uint) {
        return balanceOf[_address];
    }

    // 扣除游戏费用，每次游戏-1，赢得游戏则+2
    function admission(address _address) public {
        balanceOf[_address] = 10;
    }

    // 判断游戏结果，win or lose
    function checkGameResult(string _result) public {
        require(keccak256(_result) == keccak256("win") || keccak256(_result) == keccak256("lose"));
        if (keccak256(_result) == keccak256("win")) {
            balanceOf[msg.sender] += 2;
        } else {
            balanceOf[msg.sender]--;
        }
    }
}