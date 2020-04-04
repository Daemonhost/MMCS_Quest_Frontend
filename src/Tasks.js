import React, { Component } from 'react';
import { Button, DropdownButton, Dropdown, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MathJax from 'react-mathjax';
import axios from './Axios.js';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const emptyState = Object.freeze({
    text: '',
    type: '',
    equationsX: '',
    equationsY: '',
    inequalities: [['', '<', '<', '']],
    inequalitiesLeftActive: [true],
    choiceOptions: [],
    choiceSelected: 0,
    success: null
});

function parseMathjax(text) {
    return text
        .split('$')
        .map((value, index) => {
            if(index % 2 === 1)
                return (
                    <MathJax.Node inline formula={value} />
                );
            else
                return value;
        });
}

function timeSince(date2, date1) {
    let seconds = Math.floor((date2 - date1) / 1000);
    let timeString = '';

    let interval = Math.floor(seconds / 86400);
    if(interval >= 1)
        timeString += `${interval}д `;
    seconds %= 86400;

    interval = Math.floor(seconds / 3600);
    if(interval >= 1)
        timeString += `${interval}ч `;
    seconds %= 3600;

    interval = Math.floor(seconds / 60);
    if(interval >= 1)
        timeString += `${interval}м `;
    seconds %= 60;
    if(seconds >= 1)
        timeString += `${seconds}с`

    return timeString.trim();
}

class Tasks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...emptyState,
            id: localStorage.getItem('last_id') || ''
        };
    }

    componentDidMount() {
        document.title = 'Веб-квест - Задачи';
        this.get();
    }

    get() {
        let jsonRequest = {
            id: this.state.id
        };
        if(this.state.id === 'success') {
            this.setState({
                text: '',
                type: 'success'
            });
        }
        else {
            axios
                .post('/api/task/get', jsonRequest, null)
                .then(response => {
                    localStorage.setItem('last_id', response.data.id);
                    if(this.state.id === '') {
                        localStorage.setItem('start_time', new Date());
                    }
                    let newState = {
                        ...emptyState,
                        id: response.data.id,
                        text: response.data.text,
                        type: response.data.type
                    };
                    if(response.data.type === 'choice')
                        newState.choiceOptions = response.data.options;
                    this.setState(newState);
                })
                .catch(error => console.log(error));
        }
    }

    solve() {
        let jsonRequest = {
            id: this.state.id
        };
        if(this.state.type === 'equations') {
            jsonRequest.solution = {
                x: parseFloat(this.state.equationsX),
                y: parseFloat(this.state.equationsY)
            };
        }
        else if(this.state.type === 'inequalities') {
            jsonRequest.solution = this.state.inequalities.map(value => {
                let object = {};
                object[value[2]] = parseFloat(value[3]);
                if(value[1] === '<')
                    object['>'] = parseFloat(value[0]);
                else if(value[1] === '<=')
                    object['>='] = parseFloat(value[0]);
                return object;
            });
        }
        else if(this.state.type === 'choice') {
            jsonRequest.solution = this.state.choiceSelected;
        }
        else {
            return;
        }
        axios
            .post('/api/task/solve', jsonRequest, null)
            .then(response => {
                if(response.data.success) {
                    this.setState({success: true}, () => {
                        setTimeout(() => {
                            localStorage.setItem('last_id', response.data.next_task.id);
                            if(response.data.next_task.id === 'success') {
                                localStorage.setItem('end_time', new Date());
                                this.setState({
                                    ...emptyState,
                                    id: response.data.next_task.id
                                }, this.get);
                            }
                            else {
                                let newState = {
                                    ...emptyState,
                                    id: response.data.next_task.id,
                                    text: response.data.next_task.text,
                                    type: response.data.next_task.type
                                };
                                if(response.data.next_task.type === 'choice')
                                    newState.choiceOptions = response.data.next_task.options;
                                this.setState(newState);
                            }
                        }, 1500);
                    });
                }
                else {
                    this.setState({success: false}, () => {
                        setTimeout(() => {
                            this.setState({type: 'failure'});
                        }, 1500);
                    });
                }
            })
            .catch(error => console.log(error));
    }

    numericInputHandler(e) {
        const re = /[0-9.-]/g;
        if(!re.test(e.key))
            e.preventDefault();
    }

    changeInequalityInput(index, subIndex, newValue) {
        this.setState(state => {
            const inequalities = [...state.inequalities];
            const row = [...inequalities[index]];
            row[subIndex] = newValue;
            inequalities[index] = row;
            return {
                inequalities: inequalities
            };
        });
    }

    changeInequalityDropdown(index, subIndex, newValue) {
        this.setState(state => {
            const inequalities = [...state.inequalities];
            let inequalitiesLeftActive = [...state.inequalitiesLeftActive];
            const row = [...inequalities[index]];
            row[subIndex] = newValue;
            if(subIndex === 1) {
                if(newValue === ' ')
                    inequalitiesLeftActive[index] = false;
                else {
                    if(row[2] === '=')
                        row[2] = '<';
                    inequalitiesLeftActive[index] = true;
                }
            }
            else if(subIndex === 2) {
                if(newValue === '=') {
                    inequalitiesLeftActive[index] = false;
                    row[1] = ' ';
                }
            }
            inequalities[index] = row;
            return {
                inequalities: inequalities,
                inequalitiesLeftActive: inequalitiesLeftActive
            };
        });
    }

    renderResponseField() {
        if(this.state.type === 'equations') {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <div style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'left'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: '1em'
                        }}>
                            <span style={{width: '1.5em'}}>
                                x =
                            </span>
                            <input
                                className="form-control"
                                onKeyPress={this.numericInputHandler}
                                onChange={e => {
                                    const value = e.target.value;
                                    this.setState({
                                        equationsX: value
                                    });
                                }}
                                value={this.state.equationsX}
                                style={{width: '5em'}}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <span style={{width: '1.5em'}}>
                                y =
                            </span>
                            <input
                                className="form-control"
                                onKeyPress={this.numericInputHandler}
                                onChange={e => {
                                    const value = e.target.value;
                                    this.setState({
                                        equationsY: value
                                    });
                                }}
                                value={this.state.equationsY}
                                style={{width: '5em'}}
                            />
                        </div>
                    </div>
                    <div style={{
                        justifyContent: 'right'
                    }}>
                        {this.state.success === null &&
                            <Button
                                variant="primary"
                                style={{width: '10em'}}
                                onClick={() => this.solve()}
                            >
                                Отправить
                            </Button>}
                        {this.state.success === true &&
                            <Button
                                variant="success"
                                style={{width: '10em'}}
                            >
                                Правильно
                            </Button>}
                        {this.state.success === false &&
                            <Button
                                variant="danger"
                                style={{width: '10em'}}
                            >
                                Неправильно
                            </Button>}
                    </div>
                </div>
            );
        }
        else if(this.state.type === 'inequalities') {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <div style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'left'
                    }}>
                        {this.state.inequalities.map((value, index) => (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: '1em'
                            }}>
                                <input
                                    disabled={!this.state.inequalitiesLeftActive[index]}
                                    className="form-control"
                                    onKeyPress={this.numericInputHandler}
                                    onChange={e => {
                                        const value = e.target.value;
                                        this.changeInequalityInput(index, 0, value);
                                    }}
                                    value={this.state.inequalitiesLeftActive[index]
                                        ? this.state.inequalities[index][0]
                                        : ''}
                                    style={{
                                        width: '5em',
                                        marginRight: '0.5em'
                                    }}
                                />
                                <DropdownButton
                                    block={true}
                                    id={'dropdown0' + index}
                                    title={this.state.inequalities[index][1]}
                                    variant="secondary"
                                    onSelect={e => {
                                        this.changeInequalityDropdown(index, 1, e);
                                    }}
                                >
                                    <Dropdown.Item eventKey=" ">&nbsp;</Dropdown.Item>
                                    <Dropdown.Item eventKey="<">{'<'}</Dropdown.Item>
                                    <Dropdown.Item eventKey="<=">{'<='}</Dropdown.Item>
                                </DropdownButton>
                                <div style={{
                                    marginLeft: '0.5em',
                                    marginRight: '0.5em'
                                }}>
                                    x
                                </div>
                                <DropdownButton
                                    block={true}
                                    id={'dropdown1' + index}
                                    title={this.state.inequalities[index][2]}
                                    variant="secondary"
                                    onSelect={e => {
                                        this.changeInequalityDropdown(index, 2, e);
                                    }}
                                >
                                    <Dropdown.Item eventKey="=">{'='}</Dropdown.Item>
                                    <Dropdown.Item eventKey="<">{'<'}</Dropdown.Item>
                                    <Dropdown.Item eventKey="<=">{'<='}</Dropdown.Item>
                                </DropdownButton>
                                <input
                                    className="form-control"
                                    onKeyPress={this.numericInputHandler}
                                    onChange={e => {
                                        const value = e.target.value;
                                        this.changeInequalityInput(index, 3, value);
                                    }}
                                    value={this.state.inequalities[index][3]}
                                    style={{
                                        width: '5em',
                                        marginLeft: '0.5em',
                                        marginRight: '0.5em'
                                    }}
                                />
                                {index !== 0 &&
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            this.setState(state => {
                                                let inequalities = [...state.inequalities];
                                                inequalities.splice(index, 1);
                                                let inequalitiesLeftActive = [...state.inequalitiesLeftActive];
                                                inequalitiesLeftActive.splice(index, 1);
                                                return {
                                                    inequalities: inequalities,
                                                    inequalitiesLeftActive: inequalitiesLeftActive
                                                };
                                            });
                                        }}
                                    >
                                        Удалить
                                    </Button>
                                }
                            </div>
                        ))}
                        <Button
                            variant="primary"
                            onClick={() => {
                                this.setState(state => {
                                    let inequalities = [...state.inequalities, emptyState.inequalities[0]];
                                    let inequalitiesLeftActive = [...state.inequalitiesLeftActive, true];
                                    return {
                                        inequalities: inequalities,
                                        inequalitiesLeftActive: inequalitiesLeftActive
                                    };
                                });
                            }}
                        >
                            Добавить
                        </Button>
                    </div>
                    <div style={{
                        justifyContent: 'right'
                    }}>
                        {this.state.success === null &&
                            <Button
                                variant="primary"
                                style={{width: '10em'}}
                                onClick={() => this.solve()}
                            >
                                Отправить
                            </Button>}
                        {this.state.success === true &&
                            <Button
                                variant="success"
                                style={{width: '10em'}}
                            >
                                Правильно
                            </Button>}
                        {this.state.success === false &&
                            <Button
                                variant="danger"
                                style={{width: '10em'}}
                            >
                                Неправильно
                            </Button>}
                    </div>
                </div>
            );
        }
        else if(this.state.type === 'choice') {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <div style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'left'
                    }}>
                        <Form>
                            <Form.Group controlId="choiceRadio">
                                {this.state.choiceOptions.map((value, index) => (
                                    <Form.Check
                                        checked={this.state.choiceSelected === index}
                                        onClick={() => this.setState({choiceSelected: index})}
                                        type="radio"
                                        id={`choiceRadioCheck${index}`}
                                        label={parseMathjax(value)}
                                    />
                                ))}
                            </Form.Group>
                        </Form>
                    </div>
                    <div style={{
                        justifyContent: 'right'
                    }}>
                        {this.state.success === null &&
                            <Button
                                variant="primary"
                                style={{width: '10em'}}
                                onClick={() => this.solve()}
                            >
                                Отправить
                            </Button>}
                        {this.state.success === true &&
                            <Button
                                variant="success"
                                style={{width: '10em'}}
                            >
                                Правильно
                            </Button>}
                        {this.state.success === false &&
                            <Button
                                variant="danger"
                                style={{width: '10em'}}
                            >
                                Неправильно
                            </Button>}
                    </div>
                </div>
            );
        }
        else {
            return null;
        }
    }

    render() {
        return (
            <MathJax.Provider>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginBottom: '1em'
                    }}>
                        <div style={{
                            flex: 1,
                            justifyContent: 'left'
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
                            justifyContent: 'right'
                        }}>
                            <Button
                                variant="primary"
                                style={{width: '10em'}}
                                onClick={() => {
                                    this.setState({id: ''}, this.get);
                                }}
                            >
                                Начать заново
                            </Button>
                        </div>
                    </div>
                    {this.state.type !== 'failure' &&
                        <div style={{
                            whiteSpace: 'pre-wrap',
                            marginBottom: '1em'
                        }}>
                            {parseMathjax(this.state.text)}
                        </div>
                    }
                    {this.state.id === 'success' &&
                        <div>
                            <center>
                                <h1>Поздравляем!</h1>
                                <span>
                                    Вы выполнили все задачи за {timeSince(
                                        new Date(localStorage.getItem('end_time')),
                                        new Date(localStorage.getItem('start_time'))
                                    )}.
                                </span>
                            </center>
                        </div>
                    }
                    {this.state.type === 'failure' &&
                        <div>
                            <center>
                                <h1>Неправильно</h1>
                                <video autoplay="autoplay" muted>
                                    <source src="/static/failure.mp4" type="video/mp4" />
                                </video>
                                <Button
                                    variant="primary"
                                    style={{width: '20em'}}
                                    onClick={() => this.get()}
                                >
                                    Попробовать еще раз
                                </Button>
                            </center>
                        </div>
                    }
                    {this.renderResponseField()}
                </div>
            </MathJax.Provider>
        );
    }
}

export default Tasks;
