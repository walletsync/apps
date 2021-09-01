import * as React from "react";
import { IMobileRegistryEntry, IQRCodeModalOptions, IAppRegistry } from "@walletconnect/types";
import {
  isIOS,
  formatIOSMobile,
  saveMobileLinkInfo,
  getMobileLinkRegistry,
  getWalletRegistryUrl,
  formatMobileRegistry,
} from "@walletconnect/browser-utils";

import { DEFAULT_BUTTON_COLOR, WALLETCONNECT_CTA_TEXT_ID } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ConnectButton from "./ConnectButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WalletButton from "./WalletButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WalletIcon from "./WalletIcon";
import { TextMap } from "../types";

interface MobileLinkDisplayProps {
  qrcodeModalOptions?: IQRCodeModalOptions;
  text: TextMap;
  uri: string;
}

const GRID_MIN_COUNT = 5;
const LINKS_PER_PAGE = 12;

function MobileLinkDisplay(props: MobileLinkDisplayProps) {
  const ios = isIOS();
  const whitelist =
    props.qrcodeModalOptions && props.qrcodeModalOptions.mobileLinks
      ? props.qrcodeModalOptions.mobileLinks
      : undefined;

  const [page, setPage] = React.useState(1);
  const [error, setError] = React.useState(false);
  const [links, setLinks] = React.useState<IMobileRegistryEntry[]>([]);
  React.useEffect(() => {
    const initMobileLinks = async () => {
      if (!ios) return;
      try {
        const url = getWalletRegistryUrl();
        const registry = (await fetch(url).then(x => x.json())) as IAppRegistry;
        const _links = getMobileLinkRegistry(formatMobileRegistry(registry), whitelist);

        setLinks(_links);
      } catch (e) {
        console.error(e); // eslint-disable-line no-console
        setError(true);
      }
    };
    initMobileLinks();
  }, []);

  const grid = links.length > GRID_MIN_COUNT;
  const pages = Math.ceil(links.length / LINKS_PER_PAGE);
  const range = [(page - 1) * LINKS_PER_PAGE + 1, page * LINKS_PER_PAGE];
  const pageLinks = links.length
    ? links.filter((_, index) => index + 1 >= range[0] && index + 1 <= range[1])
    : [];
  return (
    <div>
      <p id={WALLETCONNECT_CTA_TEXT_ID} className="walletconnect-qrcode__text">
        {ios ? props.text.choose_preferred_wallet : props.text.connect_mobile_wallet}
      </p>
      <div
        className={`walletconnect-connect__buttons__wrapper${
          !ios ? "__android" : grid ? "__wrap" : ""
        }`}
      >
        {ios ? (
          pageLinks.length ? (
            pageLinks.map((entry: IMobileRegistryEntry) => {
              const { color, name, shortName, logo } = entry;
              const href = formatIOSMobile(props.uri, entry);
              const handleClickIOS = React.useCallback(() => {
                saveMobileLinkInfo({
                  name,
                  href,
                });
              }, []);
              return !grid ? (
                <WalletButton
                  color={color}
                  href={href}
                  name={name}
                  logo={logo}
                  onClick={handleClickIOS}
                />
              ) : (
                <WalletIcon
                  color={color}
                  href={href}
                  name={shortName}
                  logo={logo}
                  onClick={handleClickIOS}
                />
              );
            })
          ) : (
            <>
              <p>{error ? `Something went wrong` : `Loading...`}</p>
            </>
          )
        ) : (
          <ConnectButton
            name={props.text.connect}
            color={DEFAULT_BUTTON_COLOR}
            href={props.uri}
            onClick={React.useCallback(() => {
              saveMobileLinkInfo({
                name: "Unknown",
                href: props.uri,
              });
            }, [])}
          />
        )}
      </div>
      {!!(ios && pages > 1) && (
        <div className="walletconnect-modal__footer">
          {Array(pages)
            .fill(0)
            .map((_, index) => {
              const pageNumber = index + 1;
              const selected = page === pageNumber;
              return (
                <a
                  style={{ margin: "auto 20px", fontWeight: selected ? "bold" : "normal" }}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </a>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default MobileLinkDisplay;
