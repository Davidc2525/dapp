// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


interface IContratoA{

    function setNumber(uint256 num) external payable;

}

contract ContratoB{

    address payable addressA;
    IContratoA private contratoA;

    constructor(address payable _addressA){
        
    }
}