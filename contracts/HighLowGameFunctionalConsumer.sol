// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract HighLowGameFunctionalConsumer is FunctionsClient, ERC721URIStorage {
    using FunctionsRequest for FunctionsRequest.Request;

    // 添加NFT铸造事件
    event NFTMinted(address indexed player, string level, uint256 score, uint256 tokenId);

    uint256 public tokenId = 0;
    // store the player of cur request
    mapping(bytes32 => address) reqIdToAddr;
    mapping(string => string) public levelToMetaDataURI;
    // call func setConfig set these vars
    uint8 public secretsSlotId;
    uint64 public secretsVersion;
    uint64 public subId;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint32 public constant GAS_LIMIT = 300_000;
    address public constant ROUTER_ADDR =
        0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 public constant DON_ID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;
    string public constant SOURCE =
        'if (!secrets.apiKey) {throw Error("API key is not provided");}'
        "const apiKey = secrets.apiKey;"
        "const playerAddress = args[0];"
        "const url = `https://zzukumylqmtazubhumyq.supabase.co/rest/v1/high_low?select=player,score&player=eq.${playerAddress}`;"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url,"
        'method: "GET",'
        'headers: {"apikey": apiKey,},'
        "});"
        "if (apiResponse.error) {"
        'console.error("API Error:", apiResponse.error, apiResponse.message, apiResponse.status);'
        "throw Error(`Request failed: ${apiResponse.message || apiResponse.error}`);"
        "}"
        "const { data } = apiResponse;"
        "if (!data[0].score) {"
        'console.error("the user does not exist");'
        'throw Error("Score does not exist, request failed");'
        "}"
        "return Functions.encodeInt256(data[0].score);";

    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor() FunctionsClient(ROUTER_ADDR) ERC721("HighLowGame", "HLG") {
        levelToMetaDataURI["Diamond"] = "ipfs://Qmcb8hD8YkgSLGCKS9qT6dm6QzvEiTUHBEHLUU9ojnnxkE";
        levelToMetaDataURI["Gold"] = "ipfs://QmZZ82xBAk1csJ9nm9igaMfn6B2ZcaADDd6pYMdwFhk3S6";
        levelToMetaDataURI["Silver"] = "ipfs://Qmf4v4nxire3p9ivF2qyvtLkDq5ekgpGPsvMRgepPaRtVP";
    }

    function setConfig(
        uint8 _secretsSlotId,
        uint64 _secretsVersion,
        uint64 _subId
    ) public {
        secretsSlotId = _secretsSlotId;
        secretsVersion = _secretsVersion;
        subId = _subId;
    }

    function sendRequest(string[] memory args, address player)
        external
        returns (bytes32 requestId)
    {
        require(secretsVersion > 0, "You have to set secrets version");
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE);

        if (secretsVersion > 0) {
            req.addDONHostedSecrets(secretsSlotId, secretsVersion);
        }
        if (args.length > 0) req.setArgs(args);
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subId,
            GAS_LIMIT,
            DON_ID
        );
        reqIdToAddr[s_lastRequestId] = player;
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        s_lastError = err;
        int256 score = abi.decode(response, (int256));
        address player = reqIdToAddr[requestId];
        // gte 500
        if (score >= 500) {
            safeMint(player, levelToMetaDataURI["Diamond"]);
            emit NFTMinted(player, "Diamond", uint256(score), tokenId - 1);
            // gte 300 and lt 500
        }else if(score >= 300 && score < 500 ) {
             safeMint(player, levelToMetaDataURI["Gold"]);
             emit NFTMinted(player, "Gold", uint256(score), tokenId - 1);
            //  gte 100 and lt 300
        }else if(score >= 100 && score < 300) {
            safeMint(player, levelToMetaDataURI["Silver"]);
            emit NFTMinted(player, "Silver", uint256(score), tokenId - 1);
        }
        emit Response(requestId, s_lastResponse, s_lastError);
    }

    function safeMint(address player, string memory metaDataUrl) internal {
        _safeMint(player, tokenId);
        _setTokenURI(tokenId, metaDataUrl);
        tokenId++;
    }
}
