# python3 ./tests/lottery.spec.py
import sys
import unittest
import setup
import eosf
import time

from eosf import Verbosity
from eosf_wallet import Wallet
from eosf_account import account_create, account_master_create
from eosf_contract import Contract

eosf.Logger.verbosity = [Verbosity.EOSF, Verbosity.OUT]
eosf.set_throw_error(False)
_ = eosf.Logger()


class Test(unittest.TestCase):

    def run(self, result=None):
        super().run(result)
        print("""

NEXT TEST ====================================================================
""")

    @classmethod
    def setUpClass(cls):
        eosf.restart()
        eosf.set_is_testing_errors(False)
        eosf.set_throw_error(True)

        eosf.use_keosd(False)
        eosf.reset([eosf.Verbosity.TRACE]) 
        wallet = Wallet()
        account_master_create("account_master")

        account_create("account_admin", account_master)
        account_create("account_parent", account_master)
        account_create("account_lottery", account_master)

        contract = Contract(account_lottery, sys.path[0] + "/../")
        # contract.build()
        deploy = contract.deploy()
        time.sleep(1)
        eosf.set_throw_error(False)
        eosf.set_is_testing_errors()

    def testGrade(self):

        account_lottery.push_action(
            "addschool",
            # {
            #     "account": account_admin,
            #     "name": "Eastover"
            # },
            [account_admin, "Eastover"],
            account_admin)

        _.SCENARIO("""
        Having a school, add Grade as Admin.
        Expectation: Succeed and Data exists.
        """)

        account_lottery.push_action(
            "addgrade",
            {
                "account": account_admin,
                "schoolfk": "0",
                "grade_num": "1",
                "openings": "25"
            },
            account_admin)

        t = account_lottery.table("grade", account_lottery)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)

        _.SCENARIO("""
        Remove Grade as Parent.
        Expectation: Fail since only owner can remove.
        """)

        account_lottery.push_action(
            "remgrade", 
            {
                "account": account_parent,
                "key": "0"
            },
            account_parent)
        self.assertTrue(account_lottery.action.error)

        _.COMMENT("""
        Also, the 'grade' table should not be altered:
        """)

        t = account_lottery.table("grade", account_lottery)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)        

        _.SCENARIO("""
        Add same Grade.
        Expectation: Fail since grade must be unique.
        """)

        account_lottery.push_action(
            "addgrade", 
            # {
            #     "account": account_admin,
            #     "schoolfk": "0",
            #     "grade_num": "1",
            #     "openings": "35"                
            # }, 
            [account_admin, "0", "1", "35"],
            account_admin)
        self.assertTrue(account_lottery.action.error)

        _.COMMENT("""
        Also, the 'grade' table should not be altered:
        """)

        t = account_lottery.table("grade", account_lottery)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)
     
        _.SCENARIO("""
        Remove Grade as Admin.
        Expectation: Succeed and record removed.
        """)

        account_lottery.push_action(
            "remgrade", 
            {
                "account": account_admin,
                "key": "0"
            }, 
            account_admin)

        self.assertFalse(account_lottery.action.error)

        t = account_lottery.table("grade", account_lottery)
        self.assertEqual(t.json["rows"], [])

    @classmethod
    def tearDownClass(cls):
        eosf.stop()


if __name__ == "__main__":
    unittest.main()