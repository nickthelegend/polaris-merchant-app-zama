export const CONTRACTS = {
    MASTER: {
        POOL_MANAGER: "0xe799b8f0A37786aa77b7540E5123E4FC103a3661",
        LOAN_ENGINE: "0x47F90ca038a1fdAA370eD8C8221F874270F4b54E",
        SCORE_MANAGER: "0x224c0D64c04c0DBEb1aA6D8103f06a7911a89cd9",
        ORACLE: "0x0000000000000000000000000000000000000FD2"
    },
    // We will deploy a real "MerchantRouter" dynamically or link to one.
    // For now, these are the core protocol addresses.
};

export const NETWORKS = {
    sepolia: {
        chainId: 11155111,
        name: "Ethereum Sepolia",
        rpc: "https://1rpc.io/sepolia"
    }
};
