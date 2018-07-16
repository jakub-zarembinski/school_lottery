# python3 ./tests/lottery.spec.py

import sys
import setup
import eosf
import node
import unittest
from termcolor import cprint

setup.set_verbose(False)
setup.use_keosd(False)

class Test1(unittest.TestCase):

    def run(self, result=None):
        """ Stop after first error """
        if not result.failures:
            super().run(result)


    @classmethod
    def setUpClass(cls):
        testnet = node.reset()
        assert(not testnet.error)

        wallet = eosf.Wallet()
        assert(not wallet.error)

        account_master = eosf.AccountMaster()
        wallet.import_key(account_master)
        assert(not account_master.error)

        global account_admin
        account_admin = eosf.account(account_master)
        wallet.import_key(account_admin)
        assert(not account_admin.error)

        global account_parent
        account_parent = eosf.account(account_master)
        wallet.import_key(account_parent)
        assert(not account_parent.error)

        global account_deploy 
        account_deploy = eosf.account(account_master)
        wallet.import_key(account_deploy)
        assert(not account_deploy.error)

        global contract
        cprint(""" Create a reference to the new contract """, 'magenta')
        contract = eosf.Contract(account_deploy, sys.path[0] + "/../")

        cprint(""" Deploy the contract """, 'magenta')
        assert(not contract.deploy().error)

        cprint(""" Confirm `account_deploy` contains code """, 'magenta')
        assert(not account_deploy.code().error)


    def setUp(self):
        pass


    def testGrade(self):

        #
        # Description: Add Grade as Admin
        # Expectation: Succeed and Data exist
        #
            cprint(""" Action contract.push_action("addgrade") """, 'magenta')
            action = contract.push_action(
                "addgrade", "[" + str(account_admin) + ", 1, 25]", account_admin)
            print(action)
            self.assertFalse(action.error)
            t = contract.table("grade", account_deploy)
            self.assertFalse(t.error)
            self.assertEqual(t.json["rows"][0]["grade_num"], 1)
            self.assertEqual(t.json["rows"][0]["openings"], 25)
        #

        #
        # Description: Remove Grade as Parent
        # Expectation: Fail since only owner can remove
        #
            cprint(""" Action contract.push_action("remgrade") ***WARNING: This action should fail due to authority mismatch! """, 'magenta')
            action = contract.push_action(
                "remgrade", "[" + str(account_parent) + ", 1]", account_parent)
            print(action)
            self.assertTrue(action.error)
        #

        #
        # Description: Add same Grade
        # Expectation: Fail since grade must be unique
        #
            cprint(""" Action contract.push_action("addgrade") ***WARNING: This action should fail due to uniqueness! """, 'magenta')
            action = contract.push_action(
                "addgrade", "[" + str(account_admin) + ", 1, 35]", account_admin)
            print(action)
            self.assertTrue(action.error)
        #

        #
        # Description: Remove Grade as Admin
        # Expectation: Succeed and record removed
        #
            cprint(""" Action contract.push_action("remgrade") """, 'magenta')
            action = contract.push_action(
                "remgrade", "[" + str(account_admin) + ", 1]", account_admin)
            print(action)
            self.assertFalse(action.error)
            t = contract.table("grade", account_deploy)
            self.assertFalse(t.error)
            self.assertEqual(t.json["rows"], [])
        #

    def testStudent(self):

        #
        # Description: Add Grade as Admin
        # Expectation: Succeed and Data exist
        #
            cprint(""" Action contract.push_action("addgrade") """, 'magenta')
            action = contract.push_action(
                "addgrade", "[" + str(account_admin) + ", 2, 30]", account_admin)
            print(action)
            self.assertFalse(action.error)
            t = contract.table("grade", account_deploy)
            self.assertFalse(t.error)
            self.assertEqual(t.json["rows"][0]["grade_num"], 2)
            self.assertEqual(t.json["rows"][0]["openings"], 30)
        #

        #
        # Description: Add Student as Parent
        # Expectation: Succeed and Data exist
        #
            cprint(""" Action contract.push_action("addstudent") """, 'yellow')
            action = contract.push_action(
                "addstudent", '["' + str(account_parent) + '", 123456789, jimmy, stewart, 2]', account_parent)
            print(action)
            self.assertFalse(action.error)
            t = contract.table("student", account_deploy)
            self.assertFalse(t.error)
            self.assertEqual(t.json["rows"][0]["grade"], 2)
            self.assertEqual(t.json["rows"][0]["ssn"], 123456789)
            self.assertEqual(t.json["rows"][0]["firstname"], "jimmy")
            self.assertEqual(t.json["rows"][0]["lastname"], "stewart")
        #

        #
        # Description: Remove Student as Admin
        # Expectation: Fail since only owner can remove
        #
            cprint(""" Action contract.push_action("remstudent") ***WARNING: This action should fail due to authority mismatch! """, 'magenta')
            action = contract.push_action(
                "remstudent", "[" + str(account_admin) + ", 123456789]", account_admin)
            print(action)
            self.assertTrue(action.error)
        #

        #
        # Description: Add same student
        # Expectation: Fail since student must be unique
        #
            cprint(""" Action contract.push_action("addstudent") ***WARNING: This action should fail due to uniqueness! """, 'magenta')
            action = contract.push_action(
                "addstudent", '["' + str(account_parent) + '", 123456789, jimmy, stewart, 2]', account_parent)
            print(action)
            self.assertTrue(action.error)
        #


        #
        # Description: Remove Student as Parent
        # Expectation: Succeed and record removed
        #
            cprint(""" Action contract.push_action("remstudent") ***WARNING: This action should fail due to authority mismatch! """, 'magenta')
            action = contract.push_action(
                "remstudent", "[" + str(account_parent) + ", 123456789]", account_parent)
            print(action)
            self.assertFalse(action.error)
            t = contract.table("student", account_deploy)
            self.assertFalse(t.error)
            self.assertEqual(t.json["rows"], [])
        #

    def tearDown(self):
        pass


    @classmethod
    def tearDownClass(cls):
        node.stop()


if __name__ == "__main__":
    unittest.main()