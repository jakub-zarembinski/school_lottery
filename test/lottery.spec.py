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
from cleos import Permission

eosf.Logger.verbosity = [Verbosity.EOSF, Verbosity.OUT, Verbosity.DEBUG]
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
        print()
        eosf.restart()
        eosf.set_is_testing_errors(False)
        eosf.set_throw_error(True)

        eosf.use_keosd(False)
        eosf.reset([eosf.Verbosity.TRACE]) 
        wallet = Wallet()
        account_master_create("account_master")

        account_create("account_admin", account_master)
        account_create("account_parent", account_master)
        account_create("account_deploy", account_master)

        contract = Contract(account_deploy, sys.path[0] + "/../")
        # contract.build()
        deploy = contract.deploy()
        time.sleep(1)
        eosf.set_throw_error(False)
        eosf.set_is_testing_errors()

    def testGrade(self):

        account_deploy.push_action(
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

        account_deploy.push_action(
            "addgrade",
            {
                "account": account_admin,
                "schoolfk": "0",
                "grade_num": "1",
                "openings": "25"
            },
            account_admin)

        t = account_deploy.table("grade", account_deploy)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)

        _.SCENARIO("""
        Remove Grade as Parent.
        Expectation: Fail since only owner can remove.
        """)

        account_deploy.push_action(
            "remgrade", 
            {
                "account": account_parent,
                "key": "0"
            },
            account_parent)
        self.assertTrue(account_deploy.action.error)

        _.COMMENT("""
        Also, the 'grade' table should not be altered:
        """)

        t = account_deploy.table("grade", account_deploy)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)        

        _.SCENARIO("""
        Add same Grade.
        Expectation: Fail since grade must be unique.
        """)

        account_deploy.push_action(
            "addgrade", 
            # {
            #     "account": account_admin,
            #     "schoolfk": "0",
            #     "grade_num": "1",
            #     "openings": "35"                
            # }, 
            [account_admin, "0", "1", "35"],
            account_admin)
        self.assertTrue(account_deploy.action.error)

        _.COMMENT("""
        Also, the 'grade' table should not be altered:
        """)

        t = account_deploy.table("grade", account_deploy)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)
     
        _.SCENARIO("""
        Remove Grade as Admin.
        Expectation: Succeed and record removed.
        """)

        account_deploy.push_action(
            "remgrade", 
            {
                "account": account_admin,
                "key": "0"
            }, 
            account_admin)

        self.assertFalse(account_deploy.action.error)

        t = account_deploy.table("grade", account_deploy)
        self.assertEqual(t.json["rows"], [])
    

    def testStudent(self):

        #
        # Description: Add Grade as Admin
        # Expectation: Succeed and Data exist
        #
            # cprint(""" Action contract.push_action("addgrade") """, 'magenta')
            # action = contract.push_action(
            #     "addgrade", "[" + str(account_admin) + ", 2, 30]", account_admin)
            # print(action)
            # self.assertFalse(action.error)
            # t = contract.table("grade", account_deploy)
            # self.assertFalse(t.error)
            # self.assertEqual(t.json["rows"][0]["grade_num"], 2)
            # self.assertEqual(t.json["rows"][0]["openings"], 30)
        #

        #
        # Description: Add Student as Parent
        # Expectation: Succeed and Data exist
        #
            # cprint(""" Action contract.push_action("addstudent") """, 'yellow')
            # action = contract.push_action(
            #     "addstudent", '["' + str(account_parent) + '", 123456789, jimmy, stewart, 2]', account_parent)
            # print(action)
            # self.assertFalse(action.error)
            # t = contract.table("student", account_deploy)
            # self.assertFalse(t.error)
            # self.assertEqual(t.json["rows"][0]["grade"], 2)
            # self.assertEqual(t.json["rows"][0]["ssn"], 123456789)
            # self.assertEqual(t.json["rows"][0]["firstname"], "jimmy")
            # self.assertEqual(t.json["rows"][0]["lastname"], "stewart")
        #

        #
        # Description: Remove Student as Admin
        # Expectation: Fail since only owner can remove
        #
            # cprint(""" Action contract.push_action("remstudent") ***WARNING: This action should fail due to authority mismatch! """, 'magenta')
            # action = contract.push_action(
            #     "remstudent", "[" + str(account_admin) + ", 123456789]", account_admin)
            # print(action)
            # self.assertTrue(action.error)
        #

        #
        # Description: Add same student
        # Expectation: Fail since student must be unique
        #
            # cprint(""" Action contract.push_action("addstudent") ***WARNING: This action should fail due to uniqueness! """, 'magenta')
            # action = contract.push_action(
            #     "addstudent", '["' + str(account_parent) + '", 123456789, jimmy, stewart, 2]', account_parent)
            # print(action)
            # self.assertTrue(action.error)
        #


        #
        # Description: Remove Student as Parent
        # Expectation: Succeed and record removed
        #
            # cprint(""" Action contract.push_action("remstudent") ***WARNING: This action should fail due to authority mismatch! """, 'magenta')
            # action = contract.push_action(
            #     "remstudent", "[" + str(account_parent) + ", 123456789]", account_parent)
            # print(action)
            # self.assertFalse(action.error)
            # t = contract.table("student", account_deploy)
            # self.assertFalse(t.error)
            # self.assertEqual(t.json["rows"], [])
        #


        @classmethod
        def tearDownClass(cls):
            eosf.stop()


if __name__ == "__main__":
    unittest.main()