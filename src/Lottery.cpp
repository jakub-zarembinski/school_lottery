#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <string>
#include <eosiolib/transaction.hpp>
#include <eosiolib/crypto.h>

namespace CipherZ {
    using namespace eosio;
    using std::string;

    class Lottery : public contract {
        using contract::contract;
        
        public:
            Lottery(account_name self):contract(self) {}

            //@abi action
            void addstudent(const account_name account, uint64_t gradefk, uint64_t ssn, string firstname, string lastname) {
            require_auth(account);
            
            // Grade logic
            gradeMultiIndex grades(_self, _self);
            auto grade_iter = grades.find(gradefk);
            eosio_assert(grade_iter != grades.end(), "Grade must exist before adding a student");

            // Student insertion
            studentMultiIndex students(_self, _self);
            auto ssn_index = students.template get_index<N(byssn)>();
            auto student_iter = ssn_index.find(ssn);
            eosio_assert(student_iter == ssn_index.end(), "student already exists");

            students.emplace(account, [&](auto& student) {
                student.key = students.available_primary_key();
                student.account_name = account;
                student.ssn = ssn;
                student.firstname = firstname;
                student.lastname = lastname;
                student.gradefk = gradefk;
            });

            }

            //@abi action
            void addgrade(const account_name account, uint64_t schoolfk, uint64_t grade_num, uint64_t openings) {
                require_auth(account);

                // School logic
                schoolIndex schools(_self, _self);
                auto school_iter = schools.find(schoolfk);
                eosio_assert(school_iter != schools.end(), "School must exist before adding a grade");


                // Get Grades
                gradeMultiIndex grades(_self, _self);
                auto grade_index = grades.template get_index<N(bygrade)>();
                auto iterator = grade_index.find(grade_num);

                // Verify Grade and School
                while(iterator != grade_index.end()) {
                    auto grade = (*iterator);
                    auto school = (*school_iter);
                    eosio_assert(name{account} == name{grade.account_name}, "Only the school creator can add a grade to it");
                    auto exists = grade.grade_num == grade_num && grade.schoolfk == schoolfk 
                    && name{account} == name{grade.account_name};
                    eosio_assert(!exists, "grade already exists");
                    iterator++;
                }

                // Do the insert
                grades.emplace(account, [&](auto& _grade) {
                    _grade.key = grades.available_primary_key();
                    _grade.schoolfk = schoolfk;
                    _grade.account_name = account;
                    _grade.openings = openings;
                    _grade.grade_num = grade_num;
                    _grade.status = 0;
                });
            }

            //@abi action
            void addschool(const account_name account, string name) {
                require_auth(account);
                schoolIndex schools(_self, _self);
                schools.emplace(account, [&](auto& _school) {
                    _school.account_name = account;
                    _school.key = schools.available_primary_key();
                    _school.name = name;
                    _school.status = 0;
                });
            }

            //@abi action
            void updateschool(const account_name account, uint64_t key, string name) {
                require_auth(account);
                schoolIndex schools(_self, _self);
                auto iterator = schools.find(key);
                eosio_assert(iterator != schools.end(), "school does not exist");
                schools.modify( iterator, _self, [&]( auto& _school) {
                    _school.name = name;
                });
            }

            //@abi action
            void remschool(const account_name account, const uint64_t key) {
                require_auth(account);
                schoolIndex schools(_self, _self);
                auto iterator = schools.find(key);
                eosio_assert(iterator != schools.end(), "school does not exist");
                auto school = (*iterator);
                eosio_assert(school.account_name == account, "only supervisor can remove school");
                schools.erase(iterator);
            }

            //@abi action
            void updategrade(const account_name account, uint64_t key, uint64_t openings) {
                require_auth(account);
                gradeMultiIndex grades(_self, _self);
                auto iterator = grades.find(key);
                eosio_assert(iterator != grades.end(), "grade does not exist");
                grades.modify( iterator, _self, [&]( auto& _grade) {
                    _grade.openings = openings;
                });
            }

            //@abi action
            void updatestuden(const account_name account, uint64_t key, uint64_t ssn, string firstname, string lastname, uint64_t gradefk) {
                require_auth(account);
                 // Student insertion
                studentMultiIndex students(_self, _self);
                auto student_iter = students.find(key);
                eosio_assert(student_iter != students.end(), "student does not exist");

                students.modify( student_iter, _self, [&]( auto& student) {
                    student.firstname = firstname;
                    student.lastname = lastname;
                    student.gradefk = gradefk;
                    student.ssn = ssn;
                });
            }

            //@abi action
            void remstudent(const account_name account, const uint64_t key) {
                require_auth(account);

                studentMultiIndex students(_self, _self);
                auto iterator = students.find(key);
                eosio_assert(iterator != students.end(), "student not found");
                auto student = (*iterator);
                eosio_assert(student.account_name == account, "only parent can remove student");

                // Grade logic
                gradeMultiIndex grades(_self, _self);
                auto grade_index = grades.template get_index<N(bygrade)>();
                auto grade_iter = grade_index.find(student.gradefk);

                students.erase(iterator);

            }

            //@abi action
            void remgrade(const account_name account, const uint64_t key) {
                require_auth(account);
                gradeMultiIndex grades(_self, _self);
                auto iterator = grades.find(key);
                eosio_assert(iterator != grades.end(), "grade not found");
                auto grade = (*iterator);
                eosio_assert(grade.account_name == account, "only supervisor can remove grade");
                grades.erase(iterator);
            }

            //@abi action
            void runlottery(account_name account, uint64_t schoolkey) {
                require_auth(account);

                gradeMultiIndex grades(_self, _self);
                auto grade_index = grades.template get_index<N(byschool)>();

                auto grade_iter = grade_index.find(schoolkey);
                print("grade_iter: ", grade_iter == grade_index.end());
                    while (grade_iter != grade_index.end()) {
                        auto current_grade = (*grade_iter);
                        if(current_grade.schoolfk == schoolkey) {
                            runlotteryforgrade(account, current_grade.key);
                        }
                        grade_iter++;
                    } 

                schoolIndex schools(_self, _self);
                auto iterator = schools.find(schoolkey);
                eosio_assert(iterator != schools.end(), "school does not exist");
                schools.modify( iterator, _self, [&]( auto& _school) {
                    _school.status = 1;
                });
            }

            void runlotteryforgrade(account_name account, uint64_t gradekey) {
                require_auth(account);
                studentMultiIndex students(_self, _self);
                auto student_index = students.template get_index<N(bygrade)>();

                auto student_iter = student_index.find(gradekey);
                    uint64_t result_index = 1;
                    while (student_iter != student_index.end()) {
                        auto current_student = (*student_iter);
                        if(current_student.gradefk == gradekey) {
                            student_index.modify(student_iter, account, [&](auto& student) {
                            student.result = result_index;
                        });
                        result_index++;
                        } 
                       student_iter++;
                    }

                gradeMultiIndex grades(_self, _self);
                auto iterator = grades.find(gradekey);
                eosio_assert(iterator != grades.end(), "grade not found");
                auto grade = (*iterator);
                if(grade.key == gradekey) {
                            grades.modify(iterator, account, [&](auto& grade) {
                            grade.status = 1;
                    });
                }
            }


        private:

            //@abi table student i64
            struct student {
                uint64_t account_name;
                uint64_t key;
                uint64_t ssn;
                string firstname;
                string lastname;
                uint64_t gradefk;
                uint64_t result;

                uint64_t primary_key() const { return key; }
                uint64_t ssn_key() const { return ssn; }
                uint64_t grade_key() const { return gradefk; }
                uint64_t parent_key() const { return account_name; }

                EOSLIB_SERIALIZE(student, (account_name)(key)(ssn)(firstname)(lastname)(gradefk)(result));
            };

            typedef multi_index<N(student), student, 
            indexed_by<N(bygrade), const_mem_fun<student, uint64_t, &student::grade_key>>,
            indexed_by<N(byssn), const_mem_fun<student, uint64_t, &student::ssn_key>>,
            indexed_by<N(byparent), const_mem_fun<student, uint64_t, &student::parent_key>>> studentMultiIndex;
    
            //@abi table grade i64
            struct grade {
                uint64_t account_name;
                uint64_t key;
                uint64_t schoolfk;
                uint64_t grade_num;
                uint64_t openings;
                uint64_t status;

                uint64_t primary_key() const { return key; }
                uint64_t grade_key() const { return grade_num; }
                uint64_t school_key() const { return schoolfk; }

                EOSLIB_SERIALIZE(grade, (account_name)(key)(schoolfk)(grade_num)(openings)(status))
            };

            // typedef multi_index<N(key), key> gradeMultiIndex;
            typedef multi_index<N(grade), grade, 
            indexed_by<N(byschool), const_mem_fun<grade, uint64_t, &grade::school_key>>,
            indexed_by<N(bygrade), const_mem_fun<grade, uint64_t, &grade::grade_key>>> gradeMultiIndex;

            //@abi table school i64
            struct school {
                uint64_t account_name;
                uint64_t key;
                string name;
                uint64_t status;

                uint64_t primary_key() const { return key; }

                EOSLIB_SERIALIZE(school, (account_name)(key)(name)(status))
            };

            typedef multi_index<N(school), school> schoolIndex;
    };

    EOSIO_ABI(Lottery, (addstudent)(addgrade)(runlottery)(remstudent)(remgrade)(updategrade)(updatestuden)(addschool)(updateschool)(remschool))
}