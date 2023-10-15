# Use an official Python runtime as the base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /test

# Set environment variables
ENV FLASK_APP=app.py \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_ENV=production

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev libffi-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user to run our application
RUN useradd -M flaskuser && mkdir -p /home/flaskuser
USER flaskuser

# Set the application directory as a volume
VOLUME /test

# Copy the current directory contents into the container
COPY . .

# Make port 5000 available to the outside world
EXPOSE 5000

# Define command to run the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
