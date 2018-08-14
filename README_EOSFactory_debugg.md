"""
# Debugging EOS smart contracts

```md
This file can be executed as a python script: 
'python3 README_EOSFactory_debugg.md'.
Note, the script relies on its file's position relative to the 'src` directory, 
where is the code of the School Lottery. 
```
<pre>
The BlockOne <a href="https://eosio-cpp.readme.io/docs/debugging">advertises</a> the proposed debugging method as 'Caveman Debugging':

''The main method used to debug smart contract is Caveman Debugging, where we 
utilize the printing functionality to inspect the value of a variable and check 
the flow of the contract.''

We attempt to make it more refined, introducing a logging utility implemented 
in the 'logger.hpp` header file.
</pre>

### Include logger.hpp
```md
Let us insert the header #include, and a 'logger_info` line into the source 
code of the contract (src/Lottery.cpp):
```

```md
#define DEBUG
#include "logger.hpp"

namespace CipherZ {
    using namespace eosio;
    using std::string;

    class Lottery : public contract {
        using contract::contract;

...............................................................................        
        
            //@abi action
            void addschool(const account_name account, string name) {
                require_auth(account);

                logger_info("account: ", account); ///////////////////////////

                schoolIndex schools(_self, _self);
                schools.emplace(account, [&](auto& _school) {
                    _school.account_name = account;
                    _school.key = schools.available_primary_key();
                    _school.name = name;
                    _school.status = 0;
                });
            }

...............................................................................
```
"""
### Run a test script

```md
We hope, you see a yellow line starting 'INFO' in the printout.
```
"""
```md
"""
import sys
import unittest
import setup
import eosf
import time

from eosf import Verbosity
from eosf_wallet import Wallet
from eosf_account import account_create, account_master_create
from eosf_contract import Contract

eosf.Logger.verbosity = [Verbosity.TRACE, Verbosity.OUT, Verbosity.DEBUG]
eosf.use_keosd(False)

eosf.restart()
eosf.set_is_testing_errors(False)
eosf.set_throw_error(True)

eosf.reset([eosf.Verbosity.TRACE]) 
wallet = Wallet()
account_master_create("account_master")

account_create("account_admin", account_master)
account_create("account_parent", account_master)
account_create("account_lottery", account_master)

contract = Contract(account_lottery, sys.path[0])
contract.build()
deploy = contract.deploy()
time.sleep(1)
eosf.set_throw_error(False)
eosf.set_is_testing_errors()

account_lottery.push_action(
    "addschool",
    {
        "account": account_admin,
        "name": "Eastover"
    }, account_admin)

eosf.stop()
"""
```
<img src="resources/images/debugging.png" width="720px"/>
"""