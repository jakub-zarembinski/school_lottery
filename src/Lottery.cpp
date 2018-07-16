#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <string>

#include "logger.hpp"

namespace CipherZ {
    using namespace eosio;
    using std::string;

    class Lottery : public contract {
        using contract::contract;

        public:
            Lottery(account_name self):contract(self) {}

            //@abi action
            void addstudent(const account_name account, uint64_t ssn, string firstname, string lastname, uint64_t grade) {
            require_auth(account);

            // Grade logic
            gradeIndex grades(_self, _self);
            auto grade_iter = grades.find(grade);
            eosio_assert(grade_iter != grades.end(), "Grade must exist before adding a student");

            // Student insertion
            studentMultiIndex students(_self, _self);
            auto student_iter = students.find(ssn);
            eosio_assert(student_iter == students.end(), "student already exists");

            // auto parent_index = students.template get_index<N(byparent)>();
            // auto parent_iter = parent_index.find(account);
            // eosio_assert(parent_iter == parent_index.end(), "A student has already been entered by this parent");


            students.emplace(account, [&](auto& student) {
                student.account_name = account;
                student.ssn = ssn;
                student.firstname = firstname;
                student.lastname = lastname;
                student.grade = grade;
            });

            grades.modify(grade_iter, account, [&](auto& grade) {
                grade.applicants = grade.applicants + 1;
            });

            }

            //@abi action
            void addgrade(const account_name account, uint64_t grade_num, uint64_t openings) {
                require_auth(account);
                gradeIndex grades(_self, _self);

                logger_info("account: ", account);

                auto iterator = grades.find(grade_num);
                eosio_assert(iterator == grades.end(), "grade already exists");
                grades.emplace(account, [&](auto& _grade) {
                    _grade.account_name = account;
                    _grade.openings = openings;
                    _grade.grade_num = grade_num;
                    _grade.status = 0;
                });
            }

            //@abi action
            void updategrade(const account_name account, uint64_t grade_num, uint64_t openings) {
                require_auth(account);
                gradeIndex grades(_self, _self);
                auto iterator = grades.find(grade_num);

                logger_info("grade_num: ", grade_num);

                eosio_assert(iterator != grades.end(), "grade does not exist");
                grades.modify( iterator, _self, [&]( auto& _grade) {
                    _grade.openings = openings;
                });
            }

            //@abi action
            void updatechild(const account_name account, uint64_t ssn, string firstname, string lastname, uint64_t grade) {
                require_auth(account);
                 // Student insertion
                studentMultiIndex students(_self, _self);
                auto student_iter = students.find(ssn);
                eosio_assert(student_iter != students.end(), "student does not exist");

                students.modify( student_iter, _self, [&]( auto& student) {
                    student.firstname = firstname;
                    student.lastname = lastname;
                    student.grade = grade;
                });
            }

            //@abi action
            void getstudent(const account_name account, const uint64_t ssn) {
                require_auth(account);
                studentMultiIndex students(_self, _self);
                auto iterator = students.find(ssn);
                eosio_assert(iterator != students.end(), "student not found");
                auto student = students.get(ssn);
                eosio_assert(student.account_name == account, "only parent can view student");
                print(" **SSN: ", student.ssn, 
                    " First Name: ", student.firstname.c_str(), 
                    " Last Name: ", student.lastname.c_str(),
                    " Grade: ", student.grade,
                    " Result: ", student.result, "** ");
            }

            //@abi action
            void remstudent(const account_name account, const uint64_t ssn) {
                require_auth(account);

                studentMultiIndex students(_self, _self);
                auto iterator = students.find(ssn);
                eosio_assert(iterator != students.end(), "student not found");
                auto student = (*iterator);
                eosio_assert(student.account_name == account, "only parent can remove student");

                // Grade logic
                gradeIndex grades(_self, _self);
                auto grade_iter = grades.find(student.grade);

                if(grade_iter != grades.end()) {
                    grades.modify(grade_iter, account, [&](auto& grade) {
                    grade.applicants = grade.applicants == 0 ? 0 : grade.applicants - 1;
                });
                }

                students.erase(iterator);

            }

            //@abi action
            void remgrade(const account_name account, const uint64_t grade_num) {
                require_auth(account);
                gradeIndex grades(_self, _self);
                auto iterator = grades.find(grade_num);
                eosio_assert(iterator != grades.end(), "grade not found");
                auto grade = (*iterator);
                eosio_assert(grade.account_name == account, "only supervisor can remove grade");
                grades.erase(iterator);
            }

            //@abi action
            void getgrade(const account_name account, uint64_t grade_num) {
                require_auth(account);
                gradeIndex grades(_self, _self);
                auto iterator = grades.find(grade_num);
                eosio_assert(iterator != grades.end(), "grade does not exist");
                auto current_grade = (*iterator);
                print(" **Grade: ", current_grade.grade_num,
                        " Account: ", current_grade.account_name, 
                        " Openings: ", current_grade.openings,
                        " Applicants: ", current_grade.applicants, "** ");
            }

            //@abi action
            void getstudents(const account_name account) {
                require_auth(account);
                studentMultiIndex students(_self, _self);
                auto iterator = students.begin();
                eosio_assert(iterator != students.end(), "no students exists");
                while (iterator != students.end()) {
                    auto student = (*iterator);
                    print(" First Name: ", student.firstname.c_str(), 
                        " Last Name: ", student.lastname.c_str(),
                        " Grade: ", student.grade,
                        " Result: ", student.result, "** ");
                    iterator++;
                }
            }

            //@abi action
            void getgrades(const account_name account) {
                require_auth(account);
                gradeIndex grades(_self, _self);
                auto iterator = grades.begin();
                eosio_assert(iterator != grades.end(), "no grades exists");
                while (iterator != grades.end()) {
                    auto current_grade = (*iterator);
                    print(" **Grade: ", current_grade.grade_num, 
                        " Openings: ", current_grade.openings,
                        " Applicants: ", current_grade.applicants, "** ");
                    iterator++;
                }
            }

            //@abi action
            void runlottery(account_name account) {
                require_auth(account);
                studentMultiIndex students(_self, _self);
                auto student_index = students.template get_index<N(bygrade)>();
                gradeIndex grades(_self, _self);
                auto grade_iter = grades.begin();
                while(grade_iter != grades.end()) {
                    auto current_grade = (*grade_iter).grade_num;
                    auto student_iter = student_index.find(current_grade);
                    uint64_t result_index = 1;
                    while (student_iter != student_index.end()) {
                        auto current_student = (*student_iter);
                        if(current_student.grade == current_grade) {
                            student_index.modify(student_iter, account, [&](auto& student) {
                            student.result = result_index;
                        });
                        result_index++;
                        }
                       student_iter++;
                    }
                grades.modify(grade_iter, account, [&](auto& grade) {
                    grade.status = 1;
                });
                 grade_iter++;
                }
            }


        private:

            //@abi table student i64
            struct student {
                uint64_t account_name;
                uint64_t ssn;
                string firstname;
                string lastname;
                uint64_t grade;
                uint64_t result;

                uint64_t primary_key() const { return ssn; }
                uint64_t grade_key() const { return grade; }
                uint64_t parent_key() const { return account_name; }

                EOSLIB_SERIALIZE(student, (account_name)(ssn)(firstname)(lastname)(grade)(result));
            };

            typedef multi_index<N(student), student, 
            indexed_by<N(bygrade), const_mem_fun<student, uint64_t, &student::grade_key>>,
            indexed_by<N(byparent), const_mem_fun<student, uint64_t, &student::parent_key>>> studentMultiIndex;
    
            //@abi table grade i64
            struct grade {
                uint64_t account_name;
                uint64_t grade_num;
                uint64_t openings;
                uint64_t applicants;
                uint64_t status;

                uint64_t primary_key() const { return grade_num; }

                EOSLIB_SERIALIZE(grade, (account_name)(grade_num)(openings)(applicants)(status))
            };

            //typedef multi_index<N(student), student> studentIndex;
            typedef multi_index<N(grade), grade> gradeIndex;
    };

    EOSIO_ABI(Lottery, (addstudent)(addgrade)(getstudents)(getgrades)(getstudent)(getgrade)(runlottery)(remstudent)(remgrade)(updategrade)(updatechild))
}