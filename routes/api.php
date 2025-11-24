<?php

use App\Http\Controllers\Api\CallLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Admin\ImportController;
use App\Http\Controllers\Admin\LeadAssignmentController;
use App\Http\Controllers\LeadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles', 'permissions');
    });

    // Dashboard endpoints
    Route::get('/dashboard/agent', [DashboardController::class, 'agentDashboard']);
    Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard'])
        ->middleware('role:super_admin|manager');

    // Lead endpoints
    Route::get('/leads', [LeadController::class, 'index']);
    Route::get('/leads/todays', [LeadController::class, 'todaysLeads']);
    Route::get('/leads/{lead}', [LeadController::class, 'show']);
    Route::patch('/leads/{lead}', [LeadController::class, 'update']);
    Route::post('/leads/{lead}/lock', [LeadController::class, 'lockLead']);

    // Call log endpoints
    Route::post('/call-logs', [CallLogController::class, 'store']);
    Route::get('/call-logs/{leadId}', [CallLogController::class, 'index']);

    // Follow-up endpoints
    Route::get('/follow-ups', [FollowUpController::class, 'index']);
    Route::post('/follow-ups', [FollowUpController::class, 'store']);
    Route::post('/follow-ups/{followUp}/claim', [FollowUpController::class, 'claim']);
    Route::post('/follow-ups/{followUp}/complete', [FollowUpController::class, 'complete']);

    // Order endpoints
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);

    // Admin-only endpoints
    Route::middleware('role:super_admin|manager')->group(function () {
        // Import management
        Route::get('/admin/imports', [ImportController::class, 'index']);
        Route::post('/admin/imports/upload', [ImportController::class, 'upload']);
        Route::get('/admin/imports/{batch}', [ImportController::class, 'show']);
        Route::get('/admin/imports/{batch}/errors', [ImportController::class, 'downloadErrors']);

        // Lead assignment
        Route::post('/admin/assignments/auto-distribute', [LeadAssignmentController::class, 'autoDistribute']);
        Route::post('/admin/assignments/manual-assign', [LeadAssignmentController::class, 'manualAssign']);
        Route::post('/admin/assignments/recycle', [LeadAssignmentController::class, 'recycleLeads']);
        Route::get('/admin/assignments/stats', [LeadAssignmentController::class, 'stats']);
    });
});
