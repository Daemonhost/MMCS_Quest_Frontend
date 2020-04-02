import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import FrontPage from './FrontPage.js';
import Tasks from './Tasks.js';
import SuperTask from './SuperTask.js';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    render() {
        const frontPage = (<FrontPage />);
        const tasksPage = (<Tasks />);
        const superTaskPage = (<SuperTask />);
        return (
            <div style={{
                fontFamily: 'Roboto',
                fontWeight: 'normal',
                fontStyle: 'normal',
                fontSize: '18px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}>
                    <div class="main-component">
                        <BrowserRouter>
                            <Switch>
                                <Route
                                    exact
                                    path="/"
                                    render={() => {
                                        return frontPage;
                                    }}
                                />
                                <Route
                                    exact
                                    path="/index.html"
                                    render={() => {
                                        return frontPage;
                                    }}
                                />
                                <Route
                                    exact
                                    path="/tasks.html"
                                    render={() => {
                                        return tasksPage;
                                    }}
                                />
                                <Route
                                    exact
                                    path="/supertask.html"
                                    render={() => {
                                        return superTaskPage;
                                    }}
                                />
                            </Switch>
                        </BrowserRouter>
                    </div>
                </div>
                <div class="bottom-panel">
                    Авторы: Бурховецкий В.&thinsp;В.,
                    Ибрагимов Р.&thinsp;А., Метелица Е.&thinsp;А.,
                    Данильченко И.&thinsp;А., Штейнберг Б.&thinsp;Я.
                </div>
            </div>
        );
    }
}

// <BottomPanel>
//     Авторы: Бурховецкий В.&thinsp;В.,
//     Ибрагимов Р.&thinsp;А., Метелица Е.&thinsp;А.,
//     Данильченко И.&thinsp;, Штейнберг Б.&thinsp;Я.
// </BottomPanel>

export default App;
