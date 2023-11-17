#!/bin/bash

# Configuration
hosts_file="/private/etc/hosts"
ip_address="127.0.0.1"

host_name_example="api.example.local"
host_name_admin="awa-classroom-admin.local"
host_name_admin_api="awa-classroom-admin-api.local"
host_name_lecturer="awa-classroom-lecturer.local"
host_name_lecturer_api="awa-classroom-lecturer-api.local"
host_name_student="awa-classroom-student.local"
host_name_student_api="awa-classroom-student-api.local"
host_name_rabbitmq="rabbitmq.local"
host_name_redis="redis.local"

# Function to add an entry if it doesn't exist
add_entry() {
    local host_name=$1
    if grep -q "$host_name" "$hosts_file"; then
        echo "Entry '$host_name' already exists in the hosts file."
    else
        echo "$ip_address $host_name" | sudo tee -a "$hosts_file" >/dev/null
        echo "New entry '$host_name' added to the hosts file."
    fi
}

# Add entries
add_entry "$host_name_example"
add_entry "$host_name_admin"
add_entry "$host_name_admin_api"
add_entry "$host_name_lecturer"
add_entry "$host_name_lecturer_api"
add_entry "$host_name_student"
add_entry "$host_name_student_api"
add_entry "$host_name_rabbitmq"
add_entry "$host_name_redis"