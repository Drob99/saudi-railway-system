function htmlEmail({ url, text }) {
  return `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Changa:wght@200;300;400;500;600;700;800&display=swap");
        :root {
            --main-gd: #fff;
            --main-bg: #fff;
            --strong-bg: #fff;
            --light-color: #00b69e52;
            --lighter-color: #00b69e52;

            --strong-color: #1c7cff;
            --main-color: #2297f0;

            --error-color: #ff3737;
            --input-color: #99a3ba;
            --input-border: #cdd9ed;
            --input-background: #fff;
            --input-placeholder: #cbd1dc;
            --input-border-focus: var(--main-color);
            --group-color: var(--input-color);
            --group-border: var(--input-border);
            --group-background: #eef4ff;
            --group-color-focus: #fff;
            --group-border-focus: var(--input-border-focus);
            --group-background-focus: var(--main-color);
        }

        *,
        *::after,
        *::before {
            margin: 0;
            padding: 0;
            box-sizing: border-box;

            font-family: "Changa", sans-serif;
        }

        center {
            width: 100%;
            table-layout: fixed;
            padding: 20px 10px;
            margin: 0 auto;
        }

        .main {
            /* background: #229760; */
            height: 100px;
            width: 100%;
            max-width: 600px;
        }

        .header {
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            justify-content: space-between;
            padding: 20px 20px;
            height: 100px;
            color: var(--main-bg);
            width: 100%;
            margin: 0 auto;
            color: var(--strong-color);
            background: var(--main-bg);
            position: relative;
            border-bottom: 2px solid var(--light-color);
        }

        .header .logo {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: row-reverse;
            height: 100px;
            /* background-clip: text;
    -webkit-text-fill-color: transparent;
    background: var(--main-gd);
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent; */
            color: var(--main-bg);
            margin: 0;
            gap: 10px;
            font-size: 25px;
            user-select: none;
            -webkit-user-select: none;
            color: var(--strong-color);
            white-space: nowrap;
            text-decoration: none;
        }

        .logo svg {
            height: 50%;
            fill: var(--strong-color);
        }

        .btn {
            text-decoration: none;
            appearance: button;
            background-color: var(--strong-color);
            border: solid transparent;
            border-radius: 16px;
            border-width: 0 0 4px;
            box-sizing: border-box;
            color: #ffffff;
            cursor: pointer;
            display: inline-block;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.8px;
            line-height: 20px;
            margin: 25px auto;
            outline: none;
            overflow: visible;
            padding: 13px 16px;
            text-align: center;
            text-transform: uppercase;
            touch-action: manipulation;
            user-select: none;
            -webkit-user-select: none;
            vertical-align: middle;
            white-space: nowrap;
            width: 100px;
            position: relative;
            filter: brightness(1.1);
            -webkit-filter: brightness(1.1);
        }

        .btn:after {
            background-clip: padding-box;
            background-color: var(--main-color);
            border: solid transparent;
            border-radius: 16px;
            border-width: 0 0 4px;
            bottom: -4px;
            content: "";
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            z-index: -1;
        }

        .btn:main,
        .btn:focus {
            user-select: auto;
        }

        .btn:hover:not(:disabled) {
            filter: brightness(1.1);
            -webkit-filter: brightness(1.1);
        }

        .btn:disabled {
            cursor: auto;
        }

        .disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        .btn-cont {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>

<body>
    <center>
        <table class="main">
            <tr>
                <td class="header">
                    <center>
                        <h1 class="logo">
                            railway
                        </h1>
                    </center>
                </td>
            </tr>
            <tr>
                <td dir="rtl" class="btn-cont">
                    <center>
                        <span style="font-size:18px;">This is an email</span>
                        <br>
                        <span style="font-size:18px; font-weight:bold;" class="bold">${url}</span>
                    </center>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`;
}

module.exports = htmlEmail;
