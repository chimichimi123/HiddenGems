from .__init__ import create_app
from .Lemon import db
from .models import Genre, Instrument

def populate_database():
    genres = [
        "Rock", "Pop", "Jazz", "Classical", "Hip-Hop",
        "Electronic", "Country", "R&B", "Blues", "Folk"
    ]
    
    instruments = [
        "Guitar", "Piano", "Violin", "Drums", "Bass",
        "Saxophone", "Flute", "Trumpet", "Cello", "Harmonica"
    ]
    
    # Add genres to the database
    for genre_name in genres:
        if not Genre.query.filter_by(name=genre_name).first():
            db.session.add(Genre(name=genre_name))
    
    # Add instruments to the database
    for instrument_name in instruments:
        if not Instrument.query.filter_by(name=instrument_name).first():
            db.session.add(Instrument(name=instrument_name))
    
    db.session.commit()

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        populate_database()
