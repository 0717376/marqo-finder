import os
from flask import Flask, render_template, request, jsonify, send_from_directory
import marqo

app = Flask(__name__)

# Получаем URL Marqo из переменной окружения
MARQO_URL = os.getenv('MARQO_URL', 'http://marqo:8882')
mq = marqo.Client(url=MARQO_URL)

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        query = request.form['query']
        page = int(request.form.get('page', 1))
        per_page = int(request.form.get('per_page', 10))
        offset = (page - 1) * per_page
        
        # Выполнение поиска
        results = mq.index("my-markdown-index").search(q=query, limit=per_page, offset=offset)
        
        total_hits = results['estimated_total_hits']
        paginated_results = results['hits']
        
        return jsonify({'results': paginated_results, 'total_hits': total_hits})
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)