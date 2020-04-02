import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class FrontPage extends Component {
    componentDidMount() {
        document.title = 'Веб-квест';
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
                    <p align="justify"> Текст Супер-задачи открывается в 14-00. </p>
                    <p align="justify">
                        Решение следует присылать по электронной почте по
                        адресу <a href="mailto:XXX@sfedu.ru">XXX@sfedu.ru</a>.
                        В электронном письме Игрок должен указать свое имя,
                        класс и школу (или техникум), в которой учится.
                        Временем решения Супер-задачи считается время от 14
                        часов до получения письма с решением. За каждый символ
                        решения, не совпадающий с эталонным, ко времени Игрока
                        прибавляется 3 (штрафных) минуты. Победитель
                        получает <b>ПРИЗ</b> от директора (декана) Института математики
                        механики и компьютерных наук им. И.И. Воровича.
                    </p>
                    <p align="justify">
                        За решение обычных задач призы не выдаются.
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <div style={{
                        flex: 1,
                        justifyContent: 'left'
                    }}>
                        <Link to="/tasks.html">
                            <Button
                                variant="primary"
                                style={{width: '10em'}}
                            >
                                Задачи
                            </Button>
                        </Link>
                    </div>
                    <div style={{
                        justifyContent: 'right'
                    }}>
                        <Link to="/supertask.html">
                            <Button
                                variant="primary"
                                style={{width: '10em'}}
                            >
                                Супер-задача
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default FrontPage;
