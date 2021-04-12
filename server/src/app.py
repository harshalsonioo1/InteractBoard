import os
from flask import Flask, render_template
from flask_caching import Cache

config = {
    "DEBUG": False,
    "CACHE_TYPE": "SimpleCache",
    "CACHE_DEFAULT_TIMEOUT": 300
}


app = Flask(__name__)
app.config.from_mapping(config)
cache = Cache(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/home')
def home():
    return render_template('index.html')


@app.route('/about', methods=['GET', 'POST'])
def about():
    return render_template('about.html')


@app.route('/research', methods=['GET'])
def research():
    return render_template('research.html')


@app.route('/playground', methods=['GET'])
def playground():
    return render_template('playground.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=int(os.environ.get('PORT', 8000)))
