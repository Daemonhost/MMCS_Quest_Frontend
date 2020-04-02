import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MathJax from 'react-mathjax';
import axios from './Axios.js';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class SuperTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: ''
        };
    }

    componentDidMount() {
        document.title = 'Веб-квест - Супер-задача';
        this.get();
    }

    get() {
        let jsonRequest = {
            id: 'super'
        };
        axios
            .post('/api/task/get', jsonRequest, null)
            .then(response => {
                this.setState({
                    text: response.data.text
                });
            })
            .catch(error => console.log(error));
    }

    numericInputHandler(e) {
        const re = /[0-9.]/g;
        if(!re.test(e.key))
            e.preventDefault();
    }

    render() {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    marginBottom: '1em'
                }}>
                    <Link to="/">
                        <Button
                            variant="primary"
                            style={{width: '10em'}}
                        >
                            На главную
                        </Button>
                    </Link>
                </div>
                <div style={{
                    whiteSpace: 'pre-wrap'
                }}>
                    <MathJax.Provider>
                        {this.state.text
                            .split('$')
                            .map((value, index) => {
                                if(index % 2 === 1)
                                    return (
                                        <MathJax.Node inline formula={value} />
                                    );
                                else
                                    return value;
                            }) }
                    </MathJax.Provider>
                </div>
            </div>
        );
    }
}

export default SuperTask;
