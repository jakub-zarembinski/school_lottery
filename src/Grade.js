import React, { Component } from "react";

import "./app.css";
import "./css/pure-min.css";

export default class Grade extends Component {

    constructor(props) {
        super(props)
        if(props.grade) {
            this.state = {
                grade: props.grade.grade_num,
                openings: props.grade.openings,
                applicants: props.grade.applicants
                }
        } else {
            this.state = {
                grade: '',
                openings: '',
                applicants: ''
                }
        }
    }

    componentWillReceiveProps(newProps) {
        this.stateFromProps(newProps)
    }

    stateFromProps(props){
        if(props.grade) {
            this.setState({
                grade: props.grade.grade_num,
                openings: props.grade.openings,
                applicants: props.grade.applicants
                })
        } else {
            this.setState({
                grade: '',
                openings: '',
                applicants: ''
                })
        }
    }

    gradeFromState(){
        return {
            grade_num: this.state.grade,
            openings: this.state.openings,
            applicants: this.state.applicants,
        }
    }

    onChangeGrade(e) {
        this.setState({ grade: e.target.value,
            gradeValid: e.target.value !== '' });
    }

    onChangeOpenings(e) {
        this.setState({ openings: e.target.value,
            openingsValid: e.target.value !== '' });
    }

    isValid() {
        if(this.state.grade === '' || this.state.openings === '') {
            return false
        } else {
            return true
        }
    }

    onSave() {
        if(this.isValid()) {
            this.props.onSave(this.gradeFromState())
        }   
    }

    onUpdate() {
        if(this.isValid()) {
            this.props.onUpdate(this.props.grade, this.gradeFromState())
        }
        
    }

    renderGradeOption(grade) {
        return <option key={grade} value={grade}>{grade}</option>
    }

    renderRequiredField(key){
        console.log(this.state[key])
        if(this.state[key] === true) {
            return <div />
        } else {
            return <span className="pure-form-message-inline">This is a required field.</span>
        }
    }

    renderGradeForm() {

            let gradeOptions = []
            const allGrades = [0,1,2,3,4,5,6,7,8,9,10,11,12]
            allGrades.forEach(grade => {
                gradeOptions.push(this.renderGradeOption(grade))    
            })
            gradeOptions.unshift(<option key={''}></option>)

            let title
            let button
            console.log(this.props.grade)
            if(this.props.grade && this.props.grade.status === 1) {
                title = 'Grade'
                button = <div/>
            }
            else if(this.props.updateType === 1) {
                title = 'Update Grade'
                button = <button
                                disabled={!this.isValid()}
                                className="pure-button pure-button-primary"
                                onClick={this.onUpdate.bind(this)}>Update</button>
            } else if(this.props.updateType === 0) {
                title = 'Add Grade'
                button = <button
                                disabled={!this.isValid()}
                                className="pure-button pure-button-primary"
                                onClick={this.onSave.bind(this)}>Save</button>
            }
        return (
            <div>
                <h2>{title}</h2>
                <p>Enter the grade information</p>
                <div className="pure-form pure-form-aligned">
                    <fieldset>
                        <div className="pure-control-group">
                            <label htmlFor="name">Grade</label>
                                <select id="state"
                                value={this.state.grade}
                                disabled={this.props.updateType === 1}
                                onChange={this.onChangeGrade.bind(this)}>
                                {gradeOptions}
                        </select>   
                        {this.renderRequiredField("gradeValid")} 
                        </div>

                        <div className="pure-control-group">
                            <label htmlFor="name">Openings</label>
                            <input id="lastName" type="text" placeholder="Number of Openings"
                                disabled={this.props.grade && this.props.grade.status === 1}
                                value={this.state.openings}
                                onChange={this.onChangeOpenings.bind(this)} 
                                />
                                {this.renderRequiredField("openingsValid")}
                        </div>

                        <div className="pure-controls">
                            {button}
                            &nbsp;&nbsp;   
                        </div>
                    </fieldset>
                </div>
            </div>
        )
    }

    render() {
        if(this.props.updateType === -1) {
            return <div/>
        } else {
            return (
            <div>    
            <br />
            {this.renderGradeForm()}
            </div>
            )
        }
    }
}