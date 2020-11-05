import BigNumber from 'bignumber.js';
import BN = require('bn.js');
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import {WAD} from './constants';
import {Wallet, ContractTransaction} from 'ethers';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {BuidlerRuntimeEnvironment} from '@nomiclabs/buidler/types';

export const toWad = (value: string | number) => new BigNumber(value).times(WAD).toFixed();

export const bnToBigNumber = (amount: BN): BigNumber => new BigNumber(<any>amount);
export const stringToBigNumber = (amount: string): BigNumber => new BigNumber(amount);

export const getDb = () => low(new FileSync('./deployed-contracts.json'));

export let DRE:
  | HardhatRuntimeEnvironment
  | BuidlerRuntimeEnvironment = {} as HardhatRuntimeEnvironment;
export const setDRE = (_DRE: HardhatRuntimeEnvironment | BuidlerRuntimeEnvironment) => {
  DRE = _DRE;
};

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const createRandomAddress = () => Wallet.createRandom().address;

export const evmSnapshot = async () => await DRE.ethers.provider.send('evm_snapshot', []);

export const evmRevert = async (id: string) => DRE.ethers.provider.send('evm_revert', [id]);

export const timeLatest = async () => {
  const block = await DRE.ethers.provider.getBlock('latest');
  return new BigNumber(block.timestamp);
};

export const advanceBlock = async (timestamp: number) =>
  await DRE.ethers.provider.send('evm_mine', [timestamp]);

export const increaseTime = async (secondsToIncrease: number) => {
  await DRE.ethers.provider.send('evm_increaseTime', [secondsToIncrease]);
  await DRE.ethers.provider.send('evm_mine', []);
};

export const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);

export const filterMapBy = (raw: {[key: string]: any}, fn: (key: string) => boolean) =>
  Object.keys(raw)
    .filter(fn)
    .reduce<{[key: string]: any}>((obj, key) => {
      obj[key] = raw[key];
      return obj;
    }, {});

export const chunk = <T>(arr: Array<T>, chunkSize: number): Array<Array<T>> => {
  return arr.reduce(
    (prevVal: any, currVal: any, currIndx: number, array: Array<T>) =>
      !(currIndx % chunkSize)
        ? prevVal.concat([array.slice(currIndx, currIndx + chunkSize)])
        : prevVal,
    []
  );
};

interface DbEntry {
  [network: string]: {
    deployer: string;
    address: string;
  };
}

export const printContracts = () => {
  const network = DRE.network.name;
  const db = getDb();
  console.log('Contracts deployed at', network);
  console.log('---------------------------------');

  const entries = Object.entries<DbEntry>(db.getState()).filter(([_k, value]) => !!value[network]);

  const contractsPrint = entries.map(
    ([key, value]: [string, DbEntry]) => `${key}: ${value[network].address}`
  );

  console.log('N# Contracts:', entries.length);
  console.log(contractsPrint.join('\n'), '\n');
};
