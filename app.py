import os
from flask import Flask, render_template, request, jsonify
import marqo

app = Flask(__name__)

# Получаем URL Marqo из переменной окружения
MARQO_URL = os.getenv('MARQO_URL', 'http://marqo:8882')
mq = marqo.Client(url=MARQO_URL)

@app.route('/', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        query = request.form['query']
        page = int(request.form.get('page', 1))
        per_page = int(request.form.get('per_page', 10))
        offset = (page - 1) * per_page
        
        # Выполнение поиска
        results = mq.index("my-markdown-index").search(q=query, limit=100)
        
        total_hits = len(results['hits'])
        start = offset
        end = offset + per_page
        paginated_results = results['hits'][start:end]
        
        return jsonify({'results': paginated_results, 'total_hits': total_hits})
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)