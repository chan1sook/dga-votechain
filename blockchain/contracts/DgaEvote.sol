// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

struct VoteData {
    string voteId;
    string topicId;
    string userId;
    string choice;
}

contract DgaEvote {
    address public contractOwner;
    mapping(string => VoteData) public votes;
    event VoteCreated(string indexed _topicId, string topicId, string userId, string choice);
    
    constructor() {
        contractOwner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == contractOwner, "Only Owner can call this.");
        _;
    }

    function addVoteData(string memory voteId, string memory topicId, string memory userId, string memory choice) public onlyOwner {
        require(bytes(voteId).length > 0, "voteId not empty");
        require(bytes(topicId).length > 0, "topicId not empty");
        require(bytes(userId).length > 0, "userId not empty");

        VoteData memory newVote = VoteData(voteId, topicId, userId, choice);
        votes[voteId] = newVote;
        emit VoteCreated(voteId, topicId, userId, choice);
    }
}