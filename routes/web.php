<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    // Check if user is admin/manager
    if (auth()->user()->hasAnyRole(['super_admin', 'manager'])) {
        return Inertia::render('Admin/Dashboard');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Lead management routes
    Route::resource('leads', \App\Http\Controllers\LeadController::class);

    // Orders
    Route::get('/orders', function () {
        return Inertia::render('Orders/Index');
    })->name('orders.index');

    // Follow-ups
    Route::get('/follow-ups', function () {
        return Inertia::render('FollowUps/Index');
    })->name('follow-ups.index');

    // Commissions
    Route::get('/commissions', function () {
        return Inertia::render('Commissions/Index');
    })->name('commissions.index');

    // Admin routes
    Route::middleware('role:super_admin|manager')->prefix('admin')->group(function () {
        Route::get('/imports', [\App\Http\Controllers\Admin\ImportController::class, 'index'])->name('admin.imports.index');
        Route::post('/imports/upload', [\App\Http\Controllers\Admin\ImportController::class, 'upload'])->name('admin.imports.upload');
        Route::get('/imports/{batch}', [\App\Http\Controllers\Admin\ImportController::class, 'show'])->name('admin.imports.show');
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->names('admin.users');
    });
});

require __DIR__ . '/auth.php';
