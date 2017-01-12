/**
 * Created by johnny on 11/01/2017.
 */
import React, { Component, PropType } from 'react'

export default class App extends Component {
    constructor(){
        super();
        const workingTimeInterval = 25*60000;
        const breakTimeInterval = 5*60000;
        const timesLeft = this.getFormattedTimesLeft(workingTimeInterval)
        this.state = {
            workingTimeInterval: workingTimeInterval,
            breakTimeInterval: breakTimeInterval,
            timesLeft: timesLeft,
            status: 'stop',
            shouldUseWorkingTime: true
        }
        this.timer = undefined;
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

        if (e.target.className === 'break') {
            var time = this.state.breakTimeInterval
            if (title === '-') {
                time -= oneMinute;
            }else if (title === '+') {
                time += oneMinute;
            }
            var newTime = this.state.shouldUseWorkingTime? this.state.workingTimeInterval : time;
            this.setState({breakTimeInterval: time, timesLeft: this.getFormattedTimesLeft(newTime)});
        }else if (e.target.className === 'working') {
            var time = this.state.workingTimeInterval
            if (title === '-') {
                time -= oneMinute;
            }else if (title === '+') {
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
        const minutes = Math.floor((times/60000)%60).toString();
        const seconds = ('0' + Math.floor( (times/1000)%60 ).toString()).slice(-2);
        return {
            minutes: minutes,
            seconds: seconds,
            total: milliseconds,
        }
    }

    render() {
        const breakTime = this.getFormattedTimesLeft(this.state.breakTimeInterval);
        const workingTime = this.getFormattedTimesLeft(this.state.workingTimeInterval);
        return (
            <div>
                <div>break time: <i onClick={this.hanldeChangeClick} className="break">-</i>{breakTime.minutes}<i className="break" onClick={this.hanldeChangeClick}>+</i></div>
                <div>working time: <i className="working" onClick={this.hanldeChangeClick}>-</i>{workingTime.minutes}<i className="working" onClick={this.hanldeChangeClick}>+</i></div>
                <div onClick={this.handClockClick}>Minutes: {this.state.timesLeft.minutes} Seconds: {this.state.timesLeft.seconds}</div>
            </div>
        );
    }
}