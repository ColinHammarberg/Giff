# Use the official Python image with a tagged version
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the dependencies file to the working directory
COPY test/requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Chromium and chromedriver
RUN apt-get update \
    && apt-get install -y chromium chromium-driver \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# Set the application directory as a volume
VOLUME /test

# Copy the current directory contents into the container
COPY ./test .

# Expose port 5000 for the Flask app
EXPOSE 5000

# Command to run on container start using Gunicorn
CMD ["gunicorn", "--worker-class=gevent", "--worker-connections=1000", "--workers=3", "-b", "0.0.0.0:5000", "app:app"]