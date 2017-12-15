;(function () {

    var Loader = {
        createLink: function (url) {
            return '<link rel="stylesheet" href="' + url + '">'
        },

        createScript: function (url) {
            return '<script src="' + url + '"></script>'
        },

        isDev: function () {
            return /localhost|127\.|192\.|demo\.umaman/i.test(location.host)
        },

        isDev2: function () {
            return /localhost|127\.|192\./i.test(location.host)
        },

        getTheme: function () {
            var xhr = new XMLHttpRequest()
            xhr.open('GET', 'mock/theme.json', false)
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 4) {
                    var res = JSON.parse(xhr.responseText)
                    Loader.loadTheme(res.result || '')
                }
            }
            xhr.send()
        },

        loadTheme: function (themeName) {
            themeName = themeName || 'default'

            var version = Loader.isDev() ? Math.random() : document.querySelector('html').dataset.version

            var output = []
            output.push(Loader.createLink('dist/theme.css'))
            output.push(Loader.createScript('dist/lib.js'))
            output.push(Loader.createScript('dist/app.js'))
            output.push(Loader.createScript('dist/theme.js'))



            document.write(output.join(''))
        }
    }

    // Loader.getTheme()
    Loader.loadTheme()

})()