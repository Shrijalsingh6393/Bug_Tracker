<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $users = User::factory(5)->create();

        \App\Models\Bug::factory(10)->create([
            'reporter_id' => $admin->id,
            'assignee_id' => $users->random()->id,
        ]);

        \App\Models\Task::factory(10)->create([
            'reporter_id' => $admin->id,
            'assignee_id' => $users->random()->id,
        ]);
    }
}
