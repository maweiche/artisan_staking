// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import Head from 'next/head';
import Image from 'next/image';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';
import Switch from 'react-switch';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';
import axios from 'axios';
import bs58 from 'bs58';
import moment from 'moment';
import { sign } from 'tweetnacl';

import {
  COLLECTION_NAME,
  TOKEN_NAME,
  CUSTOMER_ID,
  ADMIN,
  MINT_ADDRESS
} from '../../constants';
import { Connect } from '../components/Connects';
import { LoadingButton } from '../components/LoadingButton';
import { api } from '../services/api';
import { calcPercentage } from '../utils/calcPercentage';
import {
  Button,
  ButtonGroup,
  ButtonLedger,
  Content,
  GridContainer,
  Header,
  InfoCard,
  StakingInfo,
  TokenContainer
} from './styles';

import 'react-dropdown/style.css';

const payout = {
  BLACK: { free: 27, full: 41 },
  RAINBOW: { free: 24, full: 36 },
  GREEN: { free: 21, full: 31 },
  CAMOUFLAGE: { free: 17, full: 26 },
  WHITE: { free: 14, full: 21 },
  BLUE: { free: 10, full: 15 },
  ORANGE: { free: 7, full: 10 },
  ORIGINAL: { free: 3, full: 5 }
};

const getDays = (date: Date): number => {
  return moment(moment()).diff(date, 'days');
};

const getPayout = (nft: any) => {
  const days = getDays(new Date(nft.stakedAt));

  return payout[nft.color][days < 30 ? 'free' : 'full'];
};

export default function Farm() {
  // const publicKey = new PublicKey(
  //   'EeY8YvgTv7ZKNXJascyjf8hQBbCieS4YQFQ1sTfNypBp'
  // );
  const { connected, signMessage, signTransaction, publicKey } = useWallet();
  const queryClient = useQueryClient();
  const [isLedger, setIsLedger] = useState(false);

  const [availableReward, setAvailableReward] = useState<any>(0);
  const [stakedNFTs, setStakedNFTs] = useState<any>();
  const [unstakedNFTs, setUnstakedNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'unstaked' | 'staked'>('unstaked');
  const [totalStaked, setTotalStaked] = useState(0);
  const [selectedUnstake, setSelectedUnstake] = useState([]);
  const [selectedStake, setSelectedStake] = useState([]);
  const [rewardDay, setRewardDay] = useState(0);

  useEffect(() => {
    console.log(selectedUnstake);
  }, [selectedUnstake]);

  useQuery(['unstaked', publicKey], () => handleGetWalletNFTs(), {
    refetchOnWindowFocus: false,
    retry: false
  });
  useQuery(['info', publicKey], () => handleGetStakingInfo(), {
    refetchOnWindowFocus: false,
    retry: false
  });

  async function handleGetStakingInfo() {
    try {
      setIsLoading(true);
      const { data } = await api.get(`stake`);
      setTotalStaked(data.totalStaked);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGetWalletNFTs = useCallback(async () => {
    try {
      if (!publicKey) return;
      setIsLoading(true);
      const { data: nfts } = await api.get(`stake/${String(publicKey)}`);
      const formatedNfts = await Promise.all(
        nfts.unstaked.map(async (nft) => {
          const { data } = await axios.get(nft.uri);
          return {
            metadata: data,
            ...nft
          };
        })
      );

      const formatedNftsStaked = await Promise.all(
        nfts.staked.map(async (nft) => {
          const { data } = await axios.get(nft.uri);
          return {
            metadata: data,
            ...nft
          };
        })
      );

      setUnstakedNFTs(formatedNfts);
      setStakedNFTs(formatedNftsStaked);
      setAvailableReward(nfts.points);
      setRewardDay(nfts.dailyReward);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  const handleStake = useCallback(
    async (nfts: string[]) => {
      try {
        if (!connected || !publicKey) {
          return toast.error('Connect your wallet.');
        }

        if (!isLedger) {
          if (!signMessage) {
            return toast.error('Wallet does not support message signing!');
          }

          const message = new TextEncoder().encode('THEARTISANSTAKING');

          // Sign the bytes using the wallet
          const signature = await signMessage(message);

          // Verify that the bytes were signed using the private key that matches the known public key
          if (!sign.detached.verify(message, signature, publicKey.toBytes())) {
            throw new Error('Invalid signature!');
          }

          const reqBody = {
            wallet: String(publicKey),
            signature: bs58.encode(signature),
            nfts,
            customerId: CUSTOMER_ID,
            isLedger
          };

          await api.post('stake', reqBody);
          queryClient.refetchQueries('unstaked');
          queryClient.refetchQueries('info');

          return toast.success(
            'Congratulations! You have successfully staked your NFT.'
          );
        } else {
          const url =
            'https://fabled-magical-panorama.solana-mainnet.discover.quiknode.pro/2af224eaab7cf91c93d2aa1a62b0d8cea5b3d33e/';
          const connection = new Connection(url, 'confirmed');
          const blockhash = await connection.getLatestBlockhash();
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: publicKey,
              lamports: 0.00001 * LAMPORTS_PER_SOL
            })
          );
          transaction.recentBlockhash = blockhash.blockhash;
          transaction.feePayer = publicKey;

          const signedTransaction = await signTransaction(transaction);

          if (!signedTransaction) {
            throw new Error('Invalid signature!');
          }

          const serialized = signedTransaction.serialize();

          const reqBody = {
            wallet: String(publicKey),
            signature: serialized,
            nfts,
            customerId: CUSTOMER_ID,
            isLedger
          };

          await api.post('stake', reqBody);
          queryClient.refetchQueries('unstaked');
          queryClient.refetchQueries('info');

          return toast.success(
            'Congratulations! You have successfully staked your NFT.'
          );
        }
      } catch (error) {
        return toast.error('Something went wrong.');
      }
    },
    [isLedger, connected, publicKey]
  );

  const handleUnstake = useCallback(
    async (nfts: string[]) => {
      try {
        if (!connected || !publicKey) {
          return toast.error('Connect your wallet.');
        }

        if (!isLedger) {
          if (!signMessage) {
            return toast.error('Wallet does not support message signing!');
          }

          const message = new TextEncoder().encode('THEARTISANSTAKING');

          // Sign the bytes using the wallet
          const signature = await signMessage(message);

          // Verify that the bytes were signed using the private key that matches the known public key
          if (!sign.detached.verify(message, signature, publicKey.toBytes())) {
            throw new Error('Invalid signature!');
          }

          const reqBody = {
            wallet: String(publicKey),
            signature: bs58.encode(signature),
            nfts,
            customerId: CUSTOMER_ID,
            isLedger
          };

          await api.post('stake/unstake', reqBody);
          queryClient.refetchQueries('unstaked');
          queryClient.refetchQueries('info');

          return toast.success(
            'Congratulations! You have successfully unstaked your NFT.'
          );
        } else {
          const url =
            'https://fabled-magical-panorama.solana-mainnet.discover.quiknode.pro/2af224eaab7cf91c93d2aa1a62b0d8cea5b3d33e/';
          const connection = new Connection(url, 'confirmed');
          const blockhash = await connection.getLatestBlockhash();
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: publicKey,
              lamports: 0.00001 * LAMPORTS_PER_SOL
            })
          );
          transaction.recentBlockhash = blockhash.blockhash;
          transaction.feePayer = publicKey;

          const signedTransaction = await signTransaction(transaction);

          if (!signedTransaction) {
            throw new Error('Invalid signature!');
          }

          const serialized = signedTransaction.serialize();
          const reqBody = {
            wallet: String(publicKey),
            signature: serialized,
            nfts,
            customerId: CUSTOMER_ID,
            isLedger
          };

          await api.post('stake/unstake', reqBody);
          queryClient.refetchQueries('unstaked');
          queryClient.refetchQueries('info');

          return toast.success(
            'Congratulations! You have successfully unstaked your NFT.'
          );
        }
      } catch (error) {
        return toast.error('Something went wrong.');
      }
    },
    [isLedger, publicKey, signMessage, connected]
  );

  async function handleClaimRewards() {
    try {
      if (!availableReward) {
        toast.error('You have no reward available');
        return;
      }

      const instructions = [];
      const adminPubkey = new PublicKey(ADMIN);
      const mintPubkey = new PublicKey(MINT_ADDRESS);
      const connection = new Connection(
        'https://fabled-magical-panorama.solana-mainnet.discover.quiknode.pro/2af224eaab7cf91c93d2aa1a62b0d8cea5b3d33e/',
        'confirmed'
      );

      const mintToken = new Token(
        connection,
        mintPubkey,
        TOKEN_PROGRAM_ID,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        publicKey
      );
      try {
        const senderTokenAccount =
          await mintToken.getOrCreateAssociatedAccountInfo(adminPubkey);

        const associatedDestinationTokenAddr =
          await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintPubkey,
            publicKey
          );

        const claimerAccount = await connection.getAccountInfo(
          associatedDestinationTokenAddr
        );

        if (claimerAccount === null) {
          console.log('creating account');

          instructions.push(
            Token.createAssociatedTokenAccountInstruction(
              mintToken.associatedProgramId,
              mintToken.programId,
              mintPubkey,
              associatedDestinationTokenAddr,
              publicKey,
              publicKey
            )
          );
        }

        console.log(9);

        instructions.push(
          Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            senderTokenAccount.address,
            associatedDestinationTokenAddr,
            adminPubkey,
            [],
            availableReward * Math.pow(10, 9)
          )
        );
      } catch (error) {
        console.log(error);
      }

      const transaction = new Transaction().add(...instructions);

      transaction.feePayer = publicKey;

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const tx = await signTransaction(transaction);
      const serialized = tx.serialize({
        verifySignatures: false
      });

      const reqBody = {
        wallet: String(publicKey),
        customerId: CUSTOMER_ID,
        signature: serialized
      };

      await api.post('stake/claim', reqBody);
      queryClient.refetchQueries('unstaked');
      queryClient.refetchQueries('info');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>{COLLECTION_NAME} Staking</title>
      </Head>
      <Header>
        <div className="collection-info">
          <Image
            src={'/logo.jpg'}
            alt={`${COLLECTION_NAME} logo image"`}
            width={70}
            height={70}
          />
        </div>
        <div className="right">
          <Switch
            checked={isLedger}
            onChange={() => setIsLedger(!isLedger)}
            checkedIcon={false}
            uncheckedIcon={false}
            onColor="#c3083f"
          />
          <ButtonLedger
            isLedger={isLedger}
            onClick={() => setIsLedger(!isLedger)}
          >
            LEDGER
          </ButtonLedger>
          <Connect />
        </div>
      </Header>
      <Content>
        <StakingInfo>
          <div>
            <InfoCard>
              <h6>Total {COLLECTION_NAME} Staked</h6>
              <strong>{calcPercentage(totalStaked, 2000).toFixed(2)}%</strong>
              <div>
                <span>{totalStaked} / 2000</span>
                <progress value={totalStaked} max={2000} />
              </div>
            </InfoCard>

            <InfoCard>
              <h6>Estimated Rewards</h6>
              <strong>
                {rewardDay} ${TOKEN_NAME} per day
              </strong>
            </InfoCard>
          </div>

          {connected && (
            <div>
              <InfoCard>
                <h6>My Staked {COLLECTION_NAME}</h6>
                {stakedNFTs?.length > 0 && (
                  <strong>{String(stakedNFTs?.length)}</strong>
                )}
              </InfoCard>

              <InfoCard>
                <>
                  <h6>Current Reward</h6>
                  <strong>
                    {availableReward} ${TOKEN_NAME}
                  </strong>
                  <LoadingButton
                    onClick={handleClaimRewards}
                    isLoading={isLoading}
                  >
                    Claim Rewards
                  </LoadingButton>
                </>
              </InfoCard>
            </div>
          )}
        </StakingInfo>
        <ButtonGroup>
          <Button
            isActive={activeTab === 'unstaked'}
            onClick={() => setActiveTab('unstaked')}
            disabled={!connected || isLoading}
          >
            Unstaked {!!unstakedNFTs && connected && `(${unstakedNFTs.length})`}
          </Button>
          <Button
            isActive={activeTab === 'staked'}
            onClick={() => setActiveTab('staked')}
            disabled={!connected || isLoading}
          >
            Staked {!!stakedNFTs && connected && `(${stakedNFTs.length})`}
          </Button>
          {connected && (
            <div className="staking-actions">
              {activeTab === 'unstaked' && (
                <>
                  {selectedUnstake.length > 0 && (
                    <LoadingButton
                      onClick={() => handleStake(selectedUnstake)}
                      isLoading={isLoading}
                    >
                      Stake
                    </LoadingButton>
                  )}
                  <LoadingButton
                    onClick={() =>
                      handleStake(unstakedNFTs.map((nft) => nft.mintAddress))
                    }
                    isLoading={isLoading}
                    disabled={selectedUnstake.length > 0}
                  >
                    Stake All
                  </LoadingButton>
                </>
              )}
              {activeTab === 'staked' && (
                <>
                  {selectedStake.length > 0 && (
                    <LoadingButton
                      onClick={() => handleUnstake(selectedStake)}
                      isLoading={isLoading}
                    >
                      Unstake
                    </LoadingButton>
                  )}
                  <LoadingButton
                    onClick={() =>
                      handleUnstake(stakedNFTs.map((nft) => nft.mintAddress))
                    }
                    isLoading={isLoading}
                    disabled={selectedStake.length > 0}
                  >
                    Unstake All
                  </LoadingButton>
                </>
              )}
            </div>
          )}
        </ButtonGroup>
        <GridContainer>
          {activeTab === 'unstaked'
            ? connected &&
              unstakedNFTs.map((token, index) => (
                <TokenContainer key={Math.random() * index}>
                  <Image
                    src={token.metadata.image}
                    alt="token"
                    width={200}
                    height={212}
                    loader={({ src, width }) => `${src}?w=${width}`}
                  />
                  <h2>{token.name}</h2>

                  <button
                    onClick={() => handleStake([token.mintAddress])}
                    disabled={isLoading}
                  >
                    STAKE
                  </button>
                </TokenContainer>
              ))
            : connected &&
              stakedNFTs?.map((token, index) => (
                <TokenContainer key={Math.random() * index}>
                  <Image
                    src={token.metadata.image}
                    alt="token"
                    width={200}
                    height={212}
                    loader={({ src, width }) => `${src}?w=${width}`}
                  />
                  <h2>{token.name}</h2>

                  <button
                    onClick={() => handleUnstake([token.mintAddress])}
                    disabled={isLoading}
                  >
                    WITHDRAW
                  </button>
                </TokenContainer>
              ))}
        </GridContainer>
      </Content>
    </>
  );
}
