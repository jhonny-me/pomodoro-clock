/**
 * Created by johnny on 11/01/2017.
 */
import React, { Component, PropType } from 'react'
require('../styles/App.css');
const startPNG = require('../resources/start.png');
const pausePNG = require('../resources/pause.png');
require('../resources/pause.png')

export default class App extends Component {
    constructor(){
        super();
        const workingTimeInterval = 25*60000;
        const breakTimeInterval = 5*60000;
        const timesLeft = this.getFormattedTimesLeft(workingTimeInterval);
        this.state = {
            workingTimeInterval: workingTimeInterval,
            breakTimeInterval: breakTimeInterval,
            timesLeft: timesLeft,
            status: 'stop',
            shouldUseWorkingTime: true
        }
        this.timer = undefined;
        this.canNotify = false;
    }

    componentDidMount() {
        var that = this
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            return
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            this.canNotify = true
        }
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    that.canNotify = true
                }
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    handClockClick = (e) => {
        console.log(this.state.status);
        const status = this.state.status;
        if (status === 'stop') {
            this.setState({status: 'counting'});
            const oneSecond = 1000;
            var that = this;
            this.timer = setInterval(function () {
                // do a pause check
                if (that.state.status === 'pause' || that.state.status === 'stop') {
                    return
                }
                var time = that.state.timesLeft.total;
                time -= oneSecond;
                // console.log(time);
                const timeLeft = that.getFormattedTimesLeft(time);
                that.setState({timesLeft: timeLeft});

                if (time < oneSecond) {
                    const shouldUseWorkingTime = !that.state.shouldUseWorkingTime;
                    const newTime = shouldUseWorkingTime? that.state.workingTimeInterval : that.state.breakTimeInterval;
                    that.setState({status: 'stop', timesLeft: that.getFormattedTimesLeft(newTime), shouldUseWorkingTime: shouldUseWorkingTime})
                    clearInterval(that.timer)
                    that.sendNotification()
                }
            }, oneSecond)
        }else if (status === 'counting') {
            this.setState({status: 'pause'})

        }else if (status === 'pause') {
            this.setState({status: 'counting'})
        }
    }

    hanldeChangeClick = (e) => {
        const title = e.target.innerHTML;
        const status = this.state.status;
        const oneMinute = 60 * 1000;

        if (e.target.className.includes('break')) {
            var time = this.state.breakTimeInterval
            if (title.includes('-')) {
                time -= oneMinute;
            }else if (title.includes('+')) {
                time += oneMinute;
            }
            var newTime = this.state.shouldUseWorkingTime? this.state.workingTimeInterval : time;
            this.setState({breakTimeInterval: time, timesLeft: this.getFormattedTimesLeft(newTime)});
        }else if (e.target.className.includes('working')) {
            var time = this.state.workingTimeInterval
            if (title.includes('-')) {
                time -= oneMinute;
            }else if (title.includes('+')) {
                time += oneMinute;
            }
            var newTime = this.state.shouldUseWorkingTime? time : this.state.breakTimeInterval;
            this.setState({workingTimeInterval: time, timesLeft: this.getFormattedTimesLeft(newTime)});
        }

        if (status != 'stop') {
            this.setState({status: 'stop'});
            clearInterval(this.timer)
        }
    }

    getFormattedTimesLeft = (milliseconds) => {
        const times = milliseconds;
        const minutes = ('0' + Math.floor((times/60000)%60).toString()).slice(-2);
        const seconds = ('0' + Math.floor( (times/1000)%60 ).toString()).slice(-2);
        return {
            minutes: minutes,
            seconds: seconds,
            total: milliseconds,
        }
    }

    sendNotification = () => {
        if (!this.canNotify) { return }
        var text = this.state.shouldUseWorkingTime ? 'Time for work' : 'Time to take a break'
        var n = new Notification(text)
        console.log(text + '  send')
    }

    render() {
        const breakTime = this.getFormattedTimesLeft(this.state.breakTimeInterval);
        const workingTime = this.getFormattedTimesLeft(this.state.workingTimeInterval);
        return (
            <div>
                <h2>Pomodoro Timer With React</h2>
                <div className="breakConfig">Break Time Interval:<i onClick={this.hanldeChangeClick} className="break stepControl">  -  </i>{breakTime.minutes}<i className="break stepControl" onClick={this.hanldeChangeClick}>  +  </i></div>
                <div className="workConfig">Working Time Interval:<i className="working stepControl" onClick={this.hanldeChangeClick}>  -  </i>{workingTime.minutes}  <i className="working stepControl" onClick={this.hanldeChangeClick}>  +  </i></div>
                <div className="session" onClick={this.handClockClick}>
                    <i className="sessionInner">{this.state.timesLeft.minutes} : {this.state.timesLeft.seconds}</i>
                    <img src={this.state.status == 'counting'? pausePNG : startPNG }/>
                </div>
            </div>
        );
    }
}