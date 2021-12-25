pragma solidity ^0.5.16;

contract Migrations {
  address public accountOwner;
  uint public last_completed_migration;

  modifier restricted() {
    if (msg.sender == accountOwner) _;
  }

  constructor() public {
    accountOwner = msg.sender;
  }

  function setCompleted(uint completed) public {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
