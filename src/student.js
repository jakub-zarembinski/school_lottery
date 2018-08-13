import React, { Component } from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import "./app.css";
import "./css/pure-min.css";

import {getStudents, editStudent, newStudent} from './reducers/eos'
class Student extends Component {

    constructor(props) {
        super(props)
        this.state = {
            firstName: '',
            lastName: '',
            grade: '',
            ssn: ''
        }
    }

    componentWillMount() {
        this.setState(this.stateFromProps(this.props))
        this.props.dispatch(getStudents(this.props.selectedGrade.key))
    }

    componentWillReceiveProps(newProps) {
        if(newProps !== this.props) {
            this.setState(this.stateFromProps(newProps))
        }
    }

    stateFromProps(props) {
        return this.stateFromStudent(props.student)
    }

    studentFromState(){
        return {
            firstname: this.state.firstName,
            lastname: this.state.lastName,
            grade_num: this.state.grade,
            ssn: this.state.ssn,
            gradefk: this.props.grade.key,
            key: this.props.selectedStudent?this.props.selectedStudent.key:undefined
        }
    }

    stateFromStudent(student){
        if(!student){
            return {
                firstName: '',
                lastName: '',
                grade: '',
                ssn: '',
            }
        }

        return {
            firstName: student.firstname,
            lastName: student.lastname,
            grade: student.grade_num,
            ssn: student.ssn,
        }
    }

    onChangeFirstName(e) {
        this.setState({ firstName: e.target.value,
            firstNameValid: e.target.value !== '' });
    }

    onChangeLastName(e) {
        this.setState({ lastName: e.target.value,
            lastNameValid: e.target.value !== '' });
    }

    onChangeGrade(e) {
        this.setState({ grade: e.target.value,
            gradeValid: e.target.value !== '' });
    }

    onChangeSSN(e) {
        this.setState({ ssn: e.target.value,
            ssnValid: e.target.value !== '' });
    }

     onDelete(child) {
        this.props.onDelete(child)
    }
    
    isValid() {
        if(this.state.firstName === '' || this.state.lastName === '' || this.props.grade.grade_num === ''
        || this.state.ssn === '') {
            return false
        } else {
            return true
        }
    }

    onSave() {
        if(this.isValid()) {
            this.props.onSave(this.studentFromState(), this.props.grade)
        } 
    }

    onUpdate() {
        if(this.isValid()) {
            this.props.onUpdate(this.studentFromState())
        } 
    }

    onAddForm() {
        this.props.dispatch(newStudent()) 
    }

    onUpdateForm(student) {
        this.props.dispatch(editStudent(student))
    }


    renderStudent(student){
        let actionView = <td>
            <button
                    className="pure-button pure-button-small"
                    onClick={()=>{}}>Email School</button>
        </td>
        if(student.result === 0) {
            actionView = <td>
            <button
                    className="pure-button pure-button-small"
                    onClick={()=>{this.onUpdateForm(student)}}>Update</button> 
            &nbsp;&nbsp;
            <button
                    className="pure-button pure-button-small"
                    onClick={()=>{this.onDelete(student)}}>Delete</button> 
        </td>
        }
        return (
        <tr key={student.ssn}>
            <td>{student.firstname}</td>
            <td>{student.lastname}</td>
            <td>{this.props.grade.grade_num}</td>
            <td>{student.ssn}</td>
            <td>{student.result}</td>
            {actionView}
        </tr>)   
    }

    renderGrade(grade) {
        return <option key={grade.grade_num} value={grade.grade_num}>{grade.grade_num}</option>
    }

    renderRequiredField(key){
        if(this.state[key] === true) {
            return <div />
        } else {
            return <span className="pure-form-message-inline">This is a required field.</span>
        }
    }

    renderStudentForm() {
        if(this.props.selectedGrade && this.props.selectedGrade.status !== 0) {
            return <div />
        } else  {
            let action = this.onSave
            let title = 'Add Student'
            if(this.props.studentActionType === 1) {
                action = this.onUpdate
                title = 'Update Student'
            }


            return (
                <div>
                    <h2>{title}</h2>
                    <p>Enter your child's information</p>
                    <div className="pure-form pure-form-aligned">
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="name">School</label>
                                <input id="school" type="text" placeholder="Child's school"
                                    value={this.props.school.name}
                                    disabled={true}
                                    />
                            </div>
                            <div className="pure-control-group">
                                <label htmlFor="name">Grade</label>
                                <input id="grade" type="text" placeholder="Child's grade"
                                    value={this.props.grade.grade_num}
                                    disabled={true}
                                    />
                            </div>
                            <div className="pure-control-group">
                                <label htmlFor="name">First Name</label>
                                <input id="firstName" type="text" placeholder="Child's first name"
                                    value={this.state.firstName}
                                    onChange={this.onChangeFirstName.bind(this)}
                                    />
                                    {this.renderRequiredField("firstNameValid")}
                            </div>

                            <div className="pure-control-group">
                                <label htmlFor="name">Last Name</label>
                                <input id="lastName" type="text" placeholder="Child's last name"
                                    value={this.state.lastName}
                                    onChange={this.onChangeLastName.bind(this)} 
                                    />
                                    {this.renderRequiredField("lastNameValid")}
                            </div>

                            <div className="pure-control-group">
                                <label htmlFor="name">SSN</label>
                                <input 
                                    id="ssn" 
                                    type="text" 
                                    placeholder="Last 4 of child's social"
                                    onChange={this.onChangeSSN.bind(this)}
                                    value={this.state.ssn}
                                    />
                                    {this.renderRequiredField("ssnValid")}
                            </div>

                            <div className="pure-controls">
                                <button
                                    disabled={!this.isValid()}
                                    className="pure-button pure-button-primary"
                                    onClick={action.bind(this)}>Save</button>
                                    &nbsp;&nbsp;   
                            </div>
                        </fieldset>
                    </div>
                </div>
            )
        }
    }

    renderAddButton() {
        if(this.props.selectedStudent && this.props.selectedStudent.result !== 0) {
            return <button
            className="pure-button pure-button-primary"
            onClick={()=>{this.onAddForm()}}>Add Student
        </button>
        } else {
            return <div />
        }
    }

    render() {

        let children = []
        let data = this.props.students ? this.props.students : []
        console.log(this.state)
        if(data) {
            data.forEach(child => {
                children.push(this.renderStudent(child))    
            })
        }

        return (
        <div className="pure-g">    
        <div className="pure-u-1-2">    
        <h2>Students</h2>
        <table className="pure-table pure-table-horizontal">
            <thead>
                <tr>
                    <th>First</th>
                    <th>Last</th>
                    <th>Grade</th>
                    <th>SSN</th>
                    <th>Placement</th>
                    <th>Action</th>
                </tr>
            </thead>
        
            <tbody>
                {children}
            </tbody>
        </table>
        <br />
        {this.renderAddButton()}
        </div>
        <div className="pure-u-1-2">
        {this.renderStudentForm()} 
        </div>                
        </div>
        )
    }
}

Student.propTypes = {
    students: PropTypes.array
  };
  
  function mapStateToProps(state) {
    return {
        students: state.eos.students,
        selectedGrade: state.eos.selectedGrade,
        studentActionType: state.eos.studentActionType,
        selectedStudent: state.eos.selectedStudent
    };
  }
  
  export default connect(
    mapStateToProps,
  )(Student);