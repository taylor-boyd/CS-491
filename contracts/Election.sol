pragma solidity ^0.5.16;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        uint age;
        string position;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    string public electionInfo;

    // just added these
    address public accountOwner;
    string public electionName;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    // election ended event
    event electionEvent();

    // constructor for when you make an election
    constructor(string memory _name) public {
        //addCandidate("Candidate 1", 22, "pres");
        //addCandidate("Candidate 2", 23, "vp");
        accountOwner = msg.sender;
        electionName = _name;
    }

    // makes sure that the person who calls the function is the account owner
    modifier accountOwnerOnly() {
        require(msg.sender == accountOwner);
        _;
    }

    // add a candidate
    function addCandidate (string memory _name, uint _age, string memory _position) accountOwnerOnly public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, _age, _position);
    }

    // add election info
    function addInfo (string memory _info) accountOwnerOnly public {
        electionInfo = _info;
    }

    // returns number of candidatess
    function getNumCandidate() public view returns (uint) {
        return candidatesCount;
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require that account owner can not vote
        require(msg.sender != accountOwner);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function endElection() accountOwnerOnly public {
        emit electionEvent();
        //selfdestruct(msg.sender);
    }
}