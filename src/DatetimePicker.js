class DatetimePicker {
    constructor(options = {}) {
        this.config = {
            parent: null,
            label: null,
            use12Hour: false,
            format: "DD.MM.YYYY HH:mm",
            placeholder: "--.--.---- --:--",
            ...options
        };

        this.selectedDate = null;
        this.tempDate = new Date();

        this._injectCSS();

        this._createInputElements();
        this._createPopupElements();

        document.addEventListener("click", (e) => {
            if (!this.popup.contains(e.target) && e.target !== this.input) {
                this._hidePopup();
            }
        });
    }

    _injectCSS() {
        if (document.getElementById("datetimepicker-dynamic-css")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "datetimepicker-dynamic-css";
        style.textContent = `
.dtp-input-container {
  display: inline-block;
  margin: 1rem;
}

.dtp-label {
  font-family: sans-serif;
  font-size: 14px;
  margin-right: 6px;
}

.dtp-input {
  min-width: 100px;
  padding: 10px 20px;
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 14px;
  font-family: sans-serif;
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
}
.dtp-input:focus {
  border-color: #2ecc71;
}

.dtp-popup {
  position: absolute;
  z-index: 9999;
  background: #fff;
  border: 2px solid #ccc;
  width: 500px;
  display: none;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  font-family: sans-serif;
  padding: 10px;
}

.dtp-popup-header {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
  text-align: center;
  position: relative;
  font-weight: bold;
  font-size: 16px;
}

.dtp-close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

.dtp-popup-body {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  gap: 10px;
  flex: 1;
}

.dtp-left {
  flex: 1;
  min-width: 200px;
}

.dtp-select-section {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.dtp-year-select,
.dtp-month-select {
  font-size: 14px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  min-width: 100px;
  box-sizing: border-box;
}
.dtp-year-select:focus,
.dtp-month-select:focus {
  outline: 2px solid #3498db;
}

.dtp-calendar {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
  background-color: #fafafa;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 250px;
}

.dtp-day-header {
  font-weight: bold;
  font-size: 12px;
  color: #666;
}

.dtp-day {
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  background-color: #fff;
  transition: background-color 0.15s;
}
.dtp-day:hover {
  background: #3498db;
  color: #fff;
}
.dtp-day.selected {
  background: #2ecc71;
  color: #fff;
}

.dtp-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 150px;
}

.dtp-am-pm-toggle {
  margin-bottom: 8px;
}

.dtp-drum-container {
  display: flex;
  gap: 10px;
}

.dtp-wheel {
  width: 60px;
  height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  scroll-behavior: smooth;
  background-color: #fff;
  flex: 1;
}

.dtp-wheel-item {
  padding: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.1s;
}
.dtp-wheel-item:hover {
  background-color: #eee;
}
.dtp-wheel-item.selected {
  background-color: #3498db;
  color: #fff;
}

.dtp-popup-footer {
  padding: 10px 0 0;
  text-align: right;
  border-top: 1px solid #ddd;
}

.dtp-btn {
  padding: 6px 12px;
  margin-left: 5px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.dtp-btn:hover {
  opacity: 0.9;
}
        `.trim();

        document.head.appendChild(style);
    }

    _createInputElements() {
        // figure out parent
        let parentEl;
        if (typeof this.config.parent === "string") {
            parentEl = document.querySelector(this.config.parent);
        } else if (this.config.parent instanceof HTMLElement) {
            parentEl = this.config.parent;
        } else {
            parentEl = document.body;
        }

        // container
        const container = document.createElement("div");
        container.classList.add("dtp-input-container");

        // optional label
        if (this.config.label) {
            const labelEl = document.createElement("label");
            labelEl.classList.add("dtp-label");
            labelEl.textContent = this.config.label;
            container.appendChild(labelEl);
        }

        // the text input
        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.classList.add("dtp-input");
        this.input.placeholder = this.config.placeholder;

        this.input.addEventListener("focus", () => this._showPopup());
        this.input.addEventListener("click", () => this._showPopup());

        container.appendChild(this.input);
        parentEl.appendChild(container);
    }

    _createPopupElements() {
        this.popup = document.createElement("div");
        this.popup.classList.add("dtp-popup");
        document.body.appendChild(this.popup);

        const header = document.createElement("div");
        header.classList.add("dtp-popup-header");
        header.textContent = "Select Date & Time";
        this.popup.appendChild(header);

        const closeBtn = document.createElement("button");
        closeBtn.classList.add("dtp-close-btn");
        closeBtn.textContent = "x";
        closeBtn.addEventListener("click", () => this._hidePopup());
        header.appendChild(closeBtn);

        const body = document.createElement("div");
        body.classList.add("dtp-popup-body");
        this.popup.appendChild(body);

        const leftSide = document.createElement("div");
        leftSide.classList.add("dtp-left");
        body.appendChild(leftSide);

        const selectSection = document.createElement("div");
        selectSection.classList.add("dtp-select-section");
        leftSide.appendChild(selectSection);

        this.yearSelect = document.createElement("select");
        this.yearSelect.classList.add("dtp-year-select");
        selectSection.appendChild(this.yearSelect);

        const nowYear = new Date().getFullYear();
        const startYear = nowYear - 20;
        const endYear = nowYear + 20;
        for (let y = startYear; y <= endYear; y++) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            this.yearSelect.appendChild(opt);
        }
        this.yearSelect.addEventListener("change", () => {
            const yr = parseInt(this.yearSelect.value, 10);
            this.tempDate.setFullYear(yr);
            this._renderCalendar();
            this._updateInputValue();
        });

        this.monthSelect = document.createElement("select");
        this.monthSelect.classList.add("dtp-month-select");
        selectSection.appendChild(this.monthSelect);

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        for (let m = 0; m < 12; m++) {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = monthNames[m];
            this.monthSelect.appendChild(opt);
        }
        this.monthSelect.addEventListener("change", () => {
            const mm = parseInt(this.monthSelect.value, 10);
            this.tempDate.setMonth(mm);
            this._renderCalendar();
            this._updateInputValue();
        });

        this.calendarEl = document.createElement("div");
        this.calendarEl.classList.add("dtp-calendar");
        leftSide.appendChild(this.calendarEl);

        const rightSide = document.createElement("div");
        rightSide.classList.add("dtp-right");
        body.appendChild(rightSide);

        this.ampmWrapper = document.createElement("div");
        this.ampmWrapper.classList.add("dtp-am-pm-toggle");
        rightSide.appendChild(this.ampmWrapper);

        const drumContainer = document.createElement("div");
        drumContainer.classList.add("dtp-drum-container");
        rightSide.appendChild(drumContainer);

        this.hourWheel = document.createElement("div");
        this.hourWheel.classList.add("dtp-wheel");
        drumContainer.appendChild(this.hourWheel);

        this.minuteWheel = document.createElement("div");
        this.minuteWheel.classList.add("dtp-wheel");
        drumContainer.appendChild(this.minuteWheel);

        const footer = document.createElement("div");
        footer.classList.add("dtp-popup-footer");
        this.popup.appendChild(footer);

        const doneBtn = document.createElement("button");
        doneBtn.classList.add("dtp-btn");
        doneBtn.textContent = "Done";
        doneBtn.addEventListener("click", () => this._commitSelection());
        footer.appendChild(doneBtn);
    }

    _showPopup() {
        const rect = this.input.getBoundingClientRect();
        this.popup.style.top = rect.bottom + window.scrollY + "px";
        this.popup.style.left = rect.left + window.scrollX + "px";
        this.popup.style.display = "block";
        this._initPopupState();
    }

    _hidePopup() {
        this.popup.style.display = "none";
    }

    _initPopupState() {
        if (!this.selectedDate) {
            this.tempDate = new Date();
        } else {
            this.tempDate = new Date(this.selectedDate.getTime());
        }
        this.yearSelect.value = this.tempDate.getFullYear().toString();
        this.monthSelect.value = this.tempDate.getMonth().toString();
        this._renderCalendar();
        this._renderAmPm();
        this._renderHourWheel();
        this._renderMinuteWheel();
    }

    _renderCalendar() {
        this.calendarEl.innerHTML = "";
        const headers = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        headers.forEach(day => {
            const hd = document.createElement("div");
            hd.classList.add("dtp-day-header");
            hd.textContent = day;
            this.calendarEl.appendChild(hd);
        });

        const year = this.tempDate.getFullYear();
        const month = this.tempDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDay = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startDay; i++) {
            const blank = document.createElement("div");
            this.calendarEl.appendChild(blank);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("dtp-day");
            dayDiv.textContent = d;

            const testDate = new Date(year, month, d);
            if (this.selectedDate && this._sameDate(testDate, this.selectedDate)) {
                dayDiv.classList.add("selected");
            }

            dayDiv.addEventListener("click", () => {
                this.tempDate.setDate(d);
                this.selectedDate = new Date(this.tempDate.getTime());
                this._renderCalendar();
                this._updateInputValue();
            });

            this.calendarEl.appendChild(dayDiv);
        }
    }

    _renderAmPm() {
        this.ampmWrapper.innerHTML = "";
        if (this.config.use12Hour) {
            const hour = this.tempDate.getHours();
            const isPM = hour >= 12;
            ["AM", "PM"].forEach(val => {
                const label = document.createElement("label");
                label.style.marginRight = "10px";

                const rb = document.createElement("input");
                rb.type = "radio";
                rb.name = "dtp-ampm";
                rb.value = val;
                rb.checked = (val === (isPM ? "PM" : "AM"));

                rb.addEventListener("change", () => {
                    const h = this.tempDate.getHours();
                    if (val === "AM" && h >= 12) {
                        this.tempDate.setHours(h - 12);
                    } else if (val === "PM" && h < 12) {
                        this.tempDate.setHours(h + 12);
                    }
                    this._renderHourWheel();
                    this._updateInputValue();
                });

                label.appendChild(rb);
                label.appendChild(document.createTextNode(val));
                this.ampmWrapper.appendChild(label);
            });
        }
    }

    _renderHourWheel() {
        this.hourWheel.innerHTML = "";

        let rangeStart = 0;
        let rangeEnd = 23;
        if (this.config.use12Hour) {
            rangeStart = 1;
            rangeEnd = 12;
        }

        const currentHour = this.tempDate.getHours();
        const displayHour = this.config.use12Hour
            ? ((currentHour + 11) % 12) + 1
            : currentHour;

        for (let h = rangeStart; h <= rangeEnd; h++) {
            const item = document.createElement("div");
            item.classList.add("dtp-wheel-item");
            item.textContent = String(h).padStart(2, "0");

            if (h === displayHour) {
                item.classList.add("selected");
            }

            item.addEventListener("click", () => {
                if (this.config.use12Hour) {
                    const oldHour = this.tempDate.getHours();
                    const wasPM = oldHour >= 12;
                    if (wasPM) {
                        this.tempDate.setHours(h === 12 ? 12 : h + 12);
                    } else {
                        this.tempDate.setHours(h === 12 ? 0 : h);
                    }
                } else {
                    this.tempDate.setHours(h);
                }
                this._renderHourWheel();
                this._updateInputValue();
            });

            this.hourWheel.appendChild(item);
        }
    }

    _renderMinuteWheel() {
        this.minuteWheel.innerHTML = "";
        const currentMin = this.tempDate.getMinutes();
        for (let m = 0; m < 60; m++) {
            const item = document.createElement("div");
            item.classList.add("dtp-wheel-item");
            item.textContent = String(m).padStart(2, "0");

            if (m === currentMin) {
                item.classList.add("selected");
            }

            item.addEventListener("click", () => {
                this.tempDate.setMinutes(m);
                this._renderMinuteWheel();
                this._updateInputValue();
            });

            this.minuteWheel.appendChild(item);
        }
    }

    _commitSelection() {
        this.selectedDate = new Date(this.tempDate.getTime());
        this._updateInputValue();
        this._hidePopup();
    }

    _updateInputValue() {
        this.input.value = this._formatDateTime(this.tempDate, this.config.format);
    }

    _sameDate(d1, d2) {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    }

    _formatDateTime(date, fmt) {
        const yyyy = date.getFullYear();
        const yy = String(yyyy).slice(-2);
        const M = date.getMonth() + 1;
        const MM = String(M).padStart(2, "0");
        const d = date.getDate();
        const dd = String(d).padStart(2, "0");
        const h24 = date.getHours();
        const hh = String(h24).padStart(2, "0");
        const m = date.getMinutes();
        const mm = String(m).padStart(2, "0");

        let str = fmt;
        str = str.replace("YYYY", yyyy)
            .replace("YY", yy)
            .replace("MM", MM)
            .replace("M", M)
            .replace("DD", dd)
            .replace("D", d)
            .replace("HH", hh)
            .replace("mm", mm);
        return str;
    }
}

export default DatetimePicker;