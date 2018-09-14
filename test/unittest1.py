import unittest, sys
from eosf import *

Logger.verbosity = [Verbosity.INFO, Verbosity.OUT, Verbosity.DEBUG]
_ = Logger()

class Test(unittest.TestCase):

    def run(self, result=None):
        super().run(result)


    @classmethod
    def setUpClass(cls):

        reset([Verbosity.TRACE])

        create_wallet()
        create_master_account("master")
        
        create_account("admin", master)
        create_account("parent", master)
        create_account("lottery", master)

        contract = Contract(lottery, sys.path[0] + "/../")
        contract.build(force=True)
        contract.deploy()


    def test_01(self):

        lottery.push_action(
            "addschool",
            # {
            #     "account": admin,
            #     "name": "Eastover"
            # },
            [admin, "Eastover"],
            admin)

        _.SCENARIO("""
        Having a school, add Grade as Admin.
        Expectation: Succeed and Data exists.
        """)

        lottery.push_action(
            "addgrade",
            {
                "account": admin,
                "schoolfk": "0",
                "grade_num": "1",
                "openings": "25"
            },
            admin)

        t = lottery.table("grade", lottery)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)

        _.SCENARIO("""
        Remove Grade as Parent.
        Expectation: Fail since only owner can remove.
        """)
        set_is_testing_errors(True)
        lottery.push_action(
            "remgrade", 
            {
                "account": parent,
                "key": "0"
            },
            parent)
        set_is_testing_errors(False)
        self.assertTrue(lottery.action.error)

        _.COMMENT("""
        Also, the 'grade' table should not be altered:
        """)

        t = lottery.table("grade", lottery)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)        

        _.SCENARIO("""
        Add same Grade.
        Expectation: Fail since grade must be unique.
        """)
        set_is_testing_errors(True)
        lottery.push_action(
            "addgrade", 
            # {
            #     "account": admin,
            #     "schoolfk": "0",
            #     "grade_num": "1",
            #     "openings": "35"                
            # }, 
            [admin, "0", "1", "35"],
            admin)
        set_is_testing_errors(False)
        self.assertTrue(lottery.action.error)

        _.COMMENT("""
        Also, the 'grade' table should not be altered:
        """)

        t = lottery.table("grade", lottery)
        self.assertEqual(t.json["rows"][0]["grade_num"], 1)
        self.assertEqual(t.json["rows"][0]["openings"], 25)
     
        _.SCENARIO("""
        Remove Grade as Admin.
        Expectation: Succeed and record removed.
        """)

        lottery.push_action(
            "remgrade", 
            {
                "account": admin,
                "key": "0"
            }, 
            admin)
        self.assertFalse(lottery.action.error)

        t = lottery.table("grade", lottery)
        self.assertEqual(t.json["rows"], [])


    @classmethod
    def tearDownClass(cls):
        stop()


if __name__ == "__main__":
    unittest.main()