<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Lead permissions
            'view_leads',
            'create_leads',
            'edit_leads',
            'delete_leads',
            'assign_leads',
            'import_leads',

            // Call log permissions
            'view_call_logs',
            'create_call_logs',

            // Follow-up permissions
            'view_follow_ups',
            'create_follow_ups',
            'complete_follow_ups',

            // Order permissions
            'view_orders',
            'create_orders',

            // Commission permissions
            'view_commissions',
            'manage_commissions',

            // Admin permissions
            'view_dashboard',
            'manage_users',
            'manage_roles',
            'view_reports',
            'manage_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin - Full access
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Manager - Can view reports and manage assignments
        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view_leads',
            'assign_leads',
            'view_call_logs',
            'view_follow_ups',
            'view_orders',
            'view_commissions',
            'view_dashboard',
            'view_reports',
        ]);

        // Agent - Can work with assigned leads
        $agent = Role::create(['name' => 'agent']);
        $agent->givePermissionTo([
            'view_leads',
            'edit_leads',
            'create_call_logs',
            'view_call_logs',
            'create_follow_ups',
            'view_follow_ups',
            'complete_follow_ups',
            'create_orders',
            'view_orders',
            'view_commissions',
            'view_dashboard',
        ]);

        // Auditor - Read-only access
        $auditor = Role::create(['name' => 'auditor']);
        $auditor->givePermissionTo([
            'view_leads',
            'view_call_logs',
            'view_follow_ups',
            'view_orders',
            'view_commissions',
            'view_reports',
        ]);

        // Create default super admin user
        $superAdminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@klassymissy.com',
            'password' => Hash::make('password'),
            'is_active' => true,
            'daily_lead_limit' => 500,
        ]);
        $superAdminUser->assignRole('super_admin');

        // Create sample manager
        $managerUser = User::create([
            'name' => 'Manager',
            'email' => 'manager@klassymissy.com',
            'password' => Hash::make('password'),
            'is_active' => true,
            'daily_lead_limit' => 300,
        ]);
        $managerUser->assignRole('manager');

        // Create sample agents
        for ($i = 1; $i <= 5; $i++) {
            $agentUser = User::create([
                'name' => "Agent {$i}",
                'email' => "agent{$i}@klassymissy.com",
                'password' => Hash::make('password'),
                'is_active' => true,
                'daily_lead_limit' => 200,
            ]);
            $agentUser->assignRole('agent');
        }

        $this->command->info('Roles and permissions seeded successfully!');
        $this->command->info('Super Admin: admin@klassymissy.com / password');
        $this->command->info('Manager: manager@klassymissy.com / password');
        $this->command->info('Agents: agent1-5@klassymissy.com / password');
    }
}
