import React, { Component } from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import "./app.css";
import "./css/pure-min.css";

import {getGrades} from './reducers/eos'

class School extends Component {

    constructor(props) {
        super(props);
        this.state = { name: props.selectedSchool.name, nameValid: true}
    }

    componentWillMount() {
        this.props.dispatch(getGrades(this.props.selectedSchool.key))
    }

    componentWillReceiveProps(newProps) {
        this.setState({name: newProps.selectedSchool.name})
    }
    
    isValid() {
    if(this.state.name === '') {
        return false
    } else {
        return true
    }
    }

    onChangeName(e) {
    this.setState({ name: e.target.value,
        nameValid: e.target.value !== '' });
    }  

    renderRequiredField(key){
        console.log(this.state[key])
        if(this.state[key] === true) {
            return <div />
        } else {
            return <span className="pure-form-message-inline">This is a required field.</span>
        }
    }

    renderGrade(grade){

        let actionView = null
        
        if(this.props.isAdmin) {
            const deleteButton = <button
                    className="pure-button pure-button-xsmall"
                    onClick={()=>{this.props.onDeleteGrade(grade)}}>Delete</button>

            actionView = <div>
            <button
                    className="pure-button pure-button-xsmall"
                    onClick={()=>{this.props.onEditGrade(grade)}}>
                    {this.props.selectedSchool.status !== 1?'Edit':'View'}</button> 
            &nbsp;&nbsp;
            {this.props.selectedSchool.status !== 1?deleteButton:<div/>}
             
        </div>
        } else {
            actionView = <button
                    className="pure-button pure-button-xsmall"
                    onClick={()=>{this.props.onManageStudents(grade)}}>{this.props.selectedSchool.status !== 1?'Manage':'View'}</button>
        }

        return (
            <tr key={grade.key}>
                <td>{grade.grade_num}</td>
                <td>{grade.openings}</td>
                <td>{grade.status === 0?'Open':'Closed'}</td>
                <td>{actionView}</td>
            </tr>
        )
    }

    renderAddGrade(){
        if(this.props.isAdmin && this.props.school.status !== 1) {
            return (
                <button
                    disabled={this.props.school.key === undefined}
                    className="pure-button pure-button-primary"
                    onClick={()=>{this.props.onAddGrade(this.props.grade)}}>
                    Add Grade
                </button>
            )
        } else {
            return null
        }
    }

    renderName() {
        if(this.props.isAdmin && this.props.school.status !== 1) {
            const isNew = this.props.school.key === undefined
            const buttonName = isNew ? 'Create School' : 'Update Name'
            return (
                <div>
                    <div className="pure-control-group">
                        <input id="name" type="text" placeholder="School Name"
                            value={this.state.name}
                            onChange={this.onChangeName.bind(this)} 
                            />
                            &nbsp;&nbsp;
                        <button
                            disabled={!this.isValid()}
                            className="pure-button pure-button-primary"
                            onClick={()=>{this.props.onUpdateSchool(this.props.school, this.state.name)}}>
                            {buttonName}
                        </button>    
                        {this.renderRequiredField("nameValid")}
                    </div>
                    <br/>
                </div>
            )
        } else {
            return <h4>{this.state.name}</h4>
        }
    }

    render() {

        let grades = []
        this.props.grades && this.props.grades.forEach(grade => {
            grades.push(this.renderGrade(grade))    
        })
        
        if(grades.length === 0) {
            const noGrades = <td colSpan="4">No Grades</td>
            grades.push(noGrades)
        }

        return (
            <div>
                
            {this.renderName()}       
            <table className="pure-table pure-table-horizontal">
            <thead>
                <tr>
                    <th>Grade</th>
                    <th>Openings</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
        
            <tbody>
                {grades}
            </tbody>
        </table>
        <br/>
        {this.renderAddGrade()}
        </div>
        )
    }
}

School.propTypes = {
    grades: PropTypes.array
  };
  
  function mapStateToProps(state) {
    return {
        grades: state.eos.grades,
        selectedSchool: state.eos.selectedSchool
    };
  }
  
  export default connect(
    mapStateToProps,
  )(School);