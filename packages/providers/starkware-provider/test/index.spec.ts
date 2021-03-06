import "mocha";
import { expect } from "chai";

import WalletConnectStarkwareProvider from "../src";

describe("WalletConnectStarkwareProvider", () => {
  it("instantiate successfully", () => {
    const provider = new WalletConnectStarkwareProvider({
      bridge: "https://staging.walletconnect.org",
      contractAddress: "0xdeadbeef",
    });
    expect(!!provider).to.be.true;
  });
});
